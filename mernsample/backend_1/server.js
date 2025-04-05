const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const cors = require('cors');
const mongoose = require('mongoose');
const csvtojson = require('csvtojson');
const { Parser } = require('json2csv'); // For CSV generation
const bcrypt = require('bcrypt');
const adminRoutes = require('./routes/admin');
require('dotenv').config(); // Load .env file

const app = express();
// Replace this:
// const port = 5000;
// With this:
const port = process.env.PORT || 5000; // Use .env PORT or default to 5000

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/admin', adminRoutes);


//mongoose.connect('mongodb://127.0.0.1:27017/mydatabase')
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// // Replace this:
// mongoose.connect('mongodb://127.0.0.1:27017/mydatabase')
// // With this:
// mongoose.connect(process.env.MONGODB_URI)

// Define the Admin schema and model
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      console.error('❌ Missing username or password');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    console.log(`🔹 Received signup request for: ${username}`);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin
    const admin = new Admin({ username, password: hashedPassword });

    await admin.save();

    console.log('✅ Admin created successfully:', admin);
    res.status(201).json({ message: 'Admin created successfully' });

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    console.log(`🔹 Login attempt for: ${username}`);

    // Find admin by username
    const admin = await Admin.findOne({ username });

    if (!admin) {
      console.error('❌ Admin not found');
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      console.error('❌ Incorrect password');
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    console.log('✅ Login successful');
    res.status(200).json({ message: 'Login successful', username });

  } catch (error) {
    console.error('❌ Error during login:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.post('/upload', upload.single('pdf'), (req, res) => {
  const { collectionName } = req.body;

  // List of valid collection names
  const validCollections = ['JEE', 'CET', 'ME', 'DSE'];

  if (!req.file || !collectionName || !validCollections.includes(collectionName)) {
    return res.status(400).send('❌ Error: Invalid file or collection name.');
  }

  console.log(`📂 File Uploaded: ${req.file.originalname}`);
  console.log(`📌 Storing Data in Collection: ${collectionName}`);

  const pdfFilePath = path.join(__dirname, 'uploads', req.file.filename);
  const initialCsvPath = pdfFilePath.replace('.pdf', '_initial.csv');
  const cleanedCsvPath = pdfFilePath.replace('.pdf', '_cleaned.csv');

  try {
    const extractTables = spawn('python', ['extract_tables.py', pdfFilePath]);
    extractTables.stderr.on('data', (data) => {
      console.error('Extract Tables Error:', data.toString());
    });

    extractTables.stdout.on('data', (data) => {
      const extractedCsvPath = data.toString().trim();
      console.log(`Extracted CSV Path: ${extractedCsvPath}`);

      const preprocessCsv = spawn('python', ['preprocess_csv.py', extractedCsvPath, cleanedCsvPath]);

      preprocessCsv.stderr.on('data', (data) => {
        console.error('Preprocess CSV Error:', data.toString());
      });

      preprocessCsv.on('close', async (preprocessCode) => {
        if (preprocessCode !== 0 || !fs.existsSync(cleanedCsvPath)) {
          console.error('Error preprocessing CSV');
          if (!res.headersSent) res.status(500).send('Preprocessing failed.');
          return;
        }

        try {
          const jsonArray = await csvtojson().fromFile(cleanedCsvPath);
          console.log(`✅ Parsed JSON Data: ${jsonArray.length} records`);

          // Ensure Collection Exists Before Inserting
          const db = mongoose.connection.db;
          const collections = await db.listCollections().toArray();
          const collectionExists = collections.some((col) => col.name === collectionName);

          if (!collectionExists) {
            console.log(`🛠️ Creating new collection: ${collectionName}`);
            await db.createCollection(collectionName);
          } else {
            console.log(`⚠️ Collection "${collectionName}" already exists. Inserting data.`);
          }

          const DynamicModel = mongoose.model(
            collectionName,
            new mongoose.Schema({}, { strict: false }), // Disable strict mode
            collectionName
          );

          await DynamicModel.insertMany(jsonArray);

          res.status(200).send({
            message: '✅ File processed and data inserted successfully.',
            collectionName,
            recordCount: jsonArray.length,
          });
        } catch (error) {
          console.error('❌ Error inserting data into MongoDB:', error);
          res.status(500).send('❌ Error processing the file.');
        }
      });
    });

    extractTables.on('close', (extractCode) => {
      if (extractCode !== 0) {
        console.error('Error extracting tables from PDF');
        if (!res.headersSent) res.status(500).send('Extraction failed.');
      }
    });
  } catch (error) {
    console.error('Error in file processing pipeline:', error);
    if (!res.headersSent) res.status(500).send('Error processing the file.');
  }
});

const userSchema = new mongoose.Schema({
  email: String,
  otp: String,
  otpExpires: Date,
});

const User = mongoose.model('User', userSchema);

// const transporter = nodemailer.createTransport({
//   service: 'Gmail',
//   auth: {
//     user: 'kolteanushree7@gmail.com', // Replace with your email
//     pass: 'chgl wnac aghv lvav', // Replace with your email password
//   },
// });

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Endpoint to generate and send OTP
app.post('/generate-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

  try {
    await User.findOneAndUpdate(
      { email },
      { email, otp, otpExpires },
      { upsert: true, new: true }
    );

    await transporter.sendMail({
      from: 'kolteanushree7@gmail.com',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    });

    res.status(200).json({ message: 'OTP sent successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending OTP.' });
  }
});

// Endpoint to verify OTP
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    res.status(200).json({ message: 'OTP verified successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying OTP.' });
  }
});

// Define the Applicant schema
const applicantSchema = new mongoose.Schema({
  applicationId: String,
  name: String,
  contactNumber: String,
  preferredBranch: String,
  email: String,
});

// Create the Applicant model
const Applicant = mongoose.model('Applicant', applicantSchema, 'applicants');

// Endpoint to save applicant data
app.post('/submit-application', async (req, res) => {
  const { applicationId, name, contactNumber, preferredBranch, email } = req.body;

  try {
    const applicant = new Applicant({
      applicationId,
      name,
      contactNumber,
      preferredBranch,
      email,
    });

    await applicant.save();
    res.status(200).json({ message: 'Application submitted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving application.' });
  }
});

app.post('/get-application', async (req, res) => {
  const { applicationId, name } = req.body;

  try {
    console.log('Received request:', { applicationId, name }); // Debugging log

    if (!applicationId || !name) {
      console.error('Application ID or Name is missing.'); // Debugging log
      return res.status(400).json({ message: 'Application ID and Name are required.' });
    }

    // List of valid collections to check
    const validCollections = ['JEE', 'CET', 'ME', 'DSE'];
    const results = [];

    // Loop through each collection and check for the applicant
    for (const collectionName of validCollections) {
      // Dynamically fetch the model for the collection
      let DynamicModel;
      if (mongoose.models[collectionName]) {
        DynamicModel = mongoose.models[collectionName];
      } else {
        DynamicModel = mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }), collectionName);
      }

      console.log(`Querying collection: ${collectionName}`); // Debugging log

      // Adjust the field name based on the collection
      const applicationIdField = collectionName === 'ME' ? 'Application ID' : 'Application\rID';

      // Query the database
      const applicant = await DynamicModel.findOne({
        [applicationIdField]: applicationId,
        "Candidate's Full Name": { $regex: new RegExp('^' + name + '$', 'i') },
      });

      if (applicant) {
        console.log(`Found applicant in ${collectionName} collection:`, applicant); // Debugging log

        // Create or fetch the merit list collection
        const meritListCollectionName = `MeritList_${collectionName}`;
        let MeritListModel;
        if (mongoose.models[meritListCollectionName]) {
          MeritListModel = mongoose.models[meritListCollectionName];
        } else {
          MeritListModel = mongoose.model(
            meritListCollectionName,
            new mongoose.Schema({}, { strict: false }),
            meritListCollectionName
          );
        }

        // Check if the applicant already exists in the merit list collection
        const existingApplicant = await MeritListModel.findOne({
          [applicationIdField]: applicationId,
          "Candidate's Full Name": { $regex: new RegExp('^' + name + '$', 'i') },
        });

        if (!existingApplicant) {
          // Insert the applicant data into the merit list collection
          await MeritListModel.create(applicant._doc);
          console.log(`Inserted applicant data into ${meritListCollectionName}`); // Debugging log
        } else {
          console.log(`Applicant already exists in ${meritListCollectionName}`); // Debugging log
        }

        // Add the result to the response
        results.push({ ...applicant._doc, examType: collectionName });
      }
    }

    if (results.length === 0) {
      console.error('No record found in any collection.'); // Debugging log
      return res.status(404).json({ message: 'No record found in any collection.' });
    }

    console.log('Returning results:', results); // Debugging log
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error retrieving application data:', error); // Debugging log
    res.status(500).json({ message: 'Error retrieving application data.' });
  }
});

function normalizeCategory(category) {
  if (!category) return '';
  // Remove special characters and spaces, then convert to lowercase
  return category.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

app.post('/get-merit-list', async (req, res) => {
  const { examType, category } = req.body;

  try {
    if (!examType) {
      return res.status(400).json({ message: 'Exam type is required.' });
    }

    const meritListCollectionName = `MeritList_${examType}`;
    const db = mongoose.connection.db;

    // Check if the collection exists
    const collections = await db.listCollections().toArray();
    const collectionExists = collections.some((col) => col.name === meritListCollectionName);

    if (!collectionExists) {
      return res.status(404).json({ message: `Collection ${meritListCollectionName} does not exist.` });
    }

    // Fetch the model for the collection
    let MeritListModel;
    if (mongoose.models[meritListCollectionName]) {
      MeritListModel = mongoose.models[meritListCollectionName];
    } else {
      MeritListModel = mongoose.model(
        meritListCollectionName,
        new mongoose.Schema({}, { strict: false }),
        meritListCollectionName
      );
    }

    console.log(`Fetching sorted merit list from collection: ${meritListCollectionName}`);

    // Determine the sorting column based on examType
    let sortColumn;
    if (examType === 'JEE' || examType === 'CET') {
      sortColumn = 'Merit\rNo';
    } else if (examType === 'ME') {
      sortColumn = 'State\rGeneral\rMerit No';
    } else {
      return res.status(400).json({ message: 'Invalid exam type.' });
    }

    // Sort by the determined column in ascending order
    const meritListData = await MeritListModel.find({})
      .sort({ [sortColumn]: 1 }) // Dynamically sort by the determined column
      .lean();

    if (!meritListData || meritListData.length === 0) {
      return res.status(404).json({ message: `No records found in ${meritListCollectionName}.` });
    }

    // Filter the merit list data by category if provided
    let filteredMeritListData = meritListData;
    if (category) {
      filteredMeritListData = meritListData.filter((record) => record.Category === category);
      if (filteredMeritListData.length === 0) {
        return res.status(404).json({ message: `No records found for category ${category} in ${meritListCollectionName}.` });
      }
    }

    console.log(`✅ Sorted Merit List Data:`, filteredMeritListData.map(d => d[sortColumn]));

    return res.status(200).json({ examType, category, meritListData: filteredMeritListData });

  } catch (error) {
    console.error('❌ Error retrieving merit list data:', error);
    res.status(500).json({ message: 'Error retrieving merit list data.' });
  }
});

// Endpoint to download merit list as CSV
app.post('/download-merit-list', async (req, res) => {
  const { examType, selectedColumns } = req.body;

  try {
    if (!examType) {
      return res.status(400).json({ message: 'Exam type is required.' });
    }

    const meritListCollectionName = `MeritList_${examType}`;
    const db = mongoose.connection.db;

    // Check if the merit list collection exists
    const collections = await db.listCollections().toArray();
    const collectionExists = collections.some((col) => col.name === meritListCollectionName);

    if (!collectionExists) {
      return res.status(404).json({ message: `Merit list collection ${meritListCollectionName} does not exist.` });
    }

    // Fetch the model for the merit list collection
    let MeritListModel;
    if (mongoose.models[meritListCollectionName]) {
      MeritListModel = mongoose.models[meritListCollectionName];
    } else {
      MeritListModel = mongoose.model(
        meritListCollectionName,
        new mongoose.Schema({}, { strict: false }),
        meritListCollectionName
      );
    }

    // Fetch all records, sorted by "meritNoNumeric"
    const meritListData = await MeritListModel.find({})
      .sort({ meritNoNumeric: 1 })
      .lean();

    if (!meritListData || meritListData.length === 0) {
      return res.status(404).json({ message: `No records found in ${meritListCollectionName}.` });
    }

    // Filter data based on selected columns (if provided)
    let filteredData = meritListData;
    if (Array.isArray(selectedColumns) && selectedColumns.length > 0) {
      filteredData = meritListData.map((record) => {
        const filteredRecord = {};
        selectedColumns.forEach((col) => {
          filteredRecord[col] = record[col];
        });
        return filteredRecord;
      });
    }

    // Convert JSON to CSV
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(filteredData);

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${examType}_merit_list.csv`);

    // Send the CSV file as a response
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ message: 'Error generating CSV.' });
  }
});

// Endpoint to count the number of registered students in MeritList_CET
app.get('/count-registered-students', async (req, res) => {
  try {
    const meritListCollectionName = 'MeritList_CET';

    // Check if the MeritList_CET collection exists
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionExists = collections.some((col) => col.name === meritListCollectionName);

    if (!collectionExists) {
      console.error(`Merit list collection ${meritListCollectionName} does not exist.`);
      return res.status(404).json({ message: `Merit list collection ${meritListCollectionName} does not exist.` });
    }
    // Fetch the model for the MeritList_CET collection
    let MeritListModel;
    if (mongoose.models[meritListCollectionName]) {
      MeritListModel = mongoose.models[meritListCollectionName];
    } else {
      MeritListModel = mongoose.model(
        meritListCollectionName,
        new mongoose.Schema({}, { strict: false }), // Disable strict mode
        meritListCollectionName
      );
    }
    // Count the number of documents in the MeritList_CET collection
    const studentCount = await MeritListModel.countDocuments({});
    console.log(`✅ Number of registered students in ${meritListCollectionName}: ${studentCount}`);
    res.status(200).json({ collectionName: meritListCollectionName, studentCount });
  } catch (error) {
    console.error('❌ Error counting registered students:', error);
    res.status(500).json({ message: 'Error counting registered students.', error: error.message });
  }
});

// Add this at the top with other model definitions
const createDynamicModel = (collectionName) => {
  if (mongoose.models[collectionName]) {
    return mongoose.model(collectionName);
  }
  return mongoose.model(
    collectionName,
    new mongoose.Schema({}, { strict: false }),
    collectionName
  );
};


// Updated endpoint
app.get('/gender-distribution', async (req, res) => {
  try {
    const collectionName = 'MeritList_CET';
    const db = mongoose.connection.db;

    // Check collection exists
    const collections = await db.listCollections().toArray();
    if (!collections.some(col => col.name === collectionName)) {
      return res.status(200).json([]);
    }

    const CollectionModel = createDynamicModel(collectionName);

    // Find gender field
    const sampleDoc = await CollectionModel.findOne();
    const genderField = ['Gender', 'gender', 'SEX', 'sex'].find(
      field => sampleDoc?.[field] !== undefined
    );

    if (!genderField) return res.status(200).json([]);

    const genderData = await CollectionModel.aggregate([
      { $match: { [genderField]: { $exists: true } } },
      { $group: { _id: `$${genderField}`, count: { $sum: 1 } } },
      { $project: { gender: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json(genderData);
  } catch (error) {
    console.error('Gender distribution error:', error);
    res.status(500).json({ 
      error: 'Failed to process gender data',
      details: error.message 
    });
  }
});


// Helper to safely get/register models
const getModel = (collectionName) => {
  if (mongoose.models[collectionName]) {
    return mongoose.model(collectionName);
  }
  return mongoose.model(
    collectionName,
    new mongoose.Schema({}, { strict: false }),
    collectionName
  );
};

// // Testable API Endpoint for Postman
// app.get('/percentile-distribution', async (req, res) => {
//   try {
//     const collectionName = 'CET';
//     const CollectionModel = getModel(collectionName);

//     // Verify collection exists
//     const count = await CollectionModel.countDocuments();
//     if (count === 0) {
//       return res.status(200).json({ message: "Collection exists but is empty", data: [] });
//     }

//     const distribution = await CollectionModel.aggregate([
//       {
//         $match: {
//           'Percentile\r_Mark': { $exists: true, $ne: null }
//         }
//       },
//       {
//         $bucket: {
//           groupBy: '$Percentile\r_Mark',
//           boundaries: [0, 50, 75, 90, 100],
//           default: "Other",
//           output: {
//             count: { $sum: 1 },
//             students: { $push: "$Candidate's Full Name" } // For debugging
//           }
//         }
//       },
//       {
//         $project: {
//           range: {
//             $switch: {
//               branches: [
//                 { case: { $eq: ["$_id", 0] }, then: "Below 50" },
//                 { case: { $eq: ["$_id", 50] }, then: "50-75" },
//                 { case: { $eq: ["$_id", 75] }, then: "75-90" },
//                 { case: { $eq: ["$_id", 90] }, then: "Above 90" }
//               ],
//               default: "$_id"
//             }
//           },
//           count: 1,
//           sampleStudents: { $slice: ["$students", 3] }, // Show 3 sample names
//           _id: 0
//         }
//       }
//     ]);

//     res.status(200).json({
//       success: true,
//       data: distribution,
//       fieldUsed: 'Percentile\r_Mark'
//     });
//   } catch (error) {
//     console.error('❌ Endpoint Error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// });
// Add this near your other routes (like /gender-distribution)
app.get('/percentile-distribution', async (req, res) => {
  try {
    const collectionName = 'CET';
    
    // Safely get the model (prevents "OverwriteModelError")
    const CollectionModel = mongoose.models[collectionName] || 
      mongoose.model(
        collectionName,
        new mongoose.Schema({}, { strict: false }),
        collectionName
      );

    // Your aggregation pipeline
    const distribution = await CollectionModel.aggregate([
      {
        $match: {
          'Percentile\r_Mark': { $exists: true, $ne: null }
        }
      },
      {
        $addFields: {
          percentileNumeric: {
            $toDouble: '$Percentile\r_Mark' // Convert string to number
          }
        }
      },
      {
        $bucket: {
          groupBy: '$percentileNumeric',
          boundaries: [0, 50, 75, 90, 101],
          default: "Other",
          output: {
            count: { $sum: 1 },
            students: { $push: "$Candidate's Full Name" }
          }
        }
      },
      {
        $project: {
          range: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 0] }, then: "Below 50" },
                { case: { $eq: ["$_id", 50] }, then: "50-75" },
                { case: { $eq: ["$_id", 75] }, then: "75-90" },
                { case: { $eq: ["$_id", 90] }, then: "90-100" }
              ],
              default: "Invalid"
            }
          },
          count: 1,
          sampleStudents: { $slice: ["$students", 3] },
          _id: 0
        }
      }
    ]);

    // Send response
    res.status(200).json({
      success: true,
      data: distribution,
      fieldUsed: 'Percentile\r_Mark' // Consistent camelCase, correct field name
    });

  } catch (error) {
    console.error('❌ Error in percentile distribution:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
