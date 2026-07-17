const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Case = require("../models/Case");
const Hearing = require("../models/Hearing");

// Helper function to create a random date within a range
const randomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

// Helper function to get a random element from an array
const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Case.deleteMany({});
    await Hearing.deleteMany({});

    // Create users
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create judges
const judges = await User.insertMany([
  {
    firstName: "Rajesh",
    lastName: "Kumar",
    email: "judge1@example.com",
    password: hashedPassword,
    role: "judge",
    courtId: "DC-001",
    phone: "+91 9876543210",
  },
  {
    firstName: "Priya",
    lastName: "Sharma",
    email: "judge2@example.com",
    password: hashedPassword,
    role: "judge",
    courtId: "HC-002",
    phone: "+91 9876543211",
  },
  {
    firstName: "Anil",
    lastName: "Verma",
    email: "judge3@example.com",
    password: hashedPassword,
    role: "judge",
    courtId: "DC-003",
    phone: "+91 9876543218",
  },
  {
    firstName: "Meena",
    lastName: "Desai",
    email: "judge4@example.com",
    password: hashedPassword,
    role: "judge",
    courtId: "HC-004",
    phone: "+91 9876543219",
  },
  {
    firstName: "Suresh",
    lastName: "Menon",
    email: "judge5@example.com",
    password: hashedPassword,
    role: "judge",
    courtId: "SC-005",
    phone: "+91 9876543220",
  },
  {
    firstName: "Geeta",
    lastName: "Naik",
    email: "judge6@example.com",
    password: hashedPassword,
    role: "judge",
    courtId: "DC-006",
    phone: "+91 9876543221",
  },
  {
    firstName: "Dinesh",
    lastName: "Patil",
    email: "judge7@example.com",
    password: hashedPassword,
    role: "judge",
    courtId: "HC-007",
    phone: "+91 9876543222",
  },
  {
    firstName: "Jyoti",
    lastName: "Reddy",
    email: "judge8@example.com",
    password: hashedPassword,
    role: "judge",
    courtId: "DC-008",
    phone: "+91 9876543223",
  },
  {
    firstName: "Ravi",
    lastName: "Iyer",
    email: "judge9@example.com",
    password: hashedPassword,
    role: "judge",
    courtId: "DC-009",
    phone: "+91 9876543224",
  },
  {
    firstName: "Kavita",
    lastName: "Mishra",
    email: "judge10@example.com",
    password: hashedPassword,
    role: "judge",
    courtId: "HC-010",
    phone: "+91 9876543225",
  },
]);

// Create lawyers
const lawyers = await User.insertMany([
  {
    firstName: "Amit",
    lastName: "Singh",
    email: "lawyer1@example.com",
    password: hashedPassword,
    role: "lawyer",
    barCouncilNumber: "MAH/12345/2020",
    phone: "+91 9876543212",
  },
  {
    firstName: "Neha",
    lastName: "Patel",
    email: "lawyer2@example.com",
    password: hashedPassword,
    role: "lawyer",
    barCouncilNumber: "DEL/67890/2019",
    phone: "+91 9876543213",
  },
  {
    firstName: "Karan",
    lastName: "Mehta",
    email: "lawyer3@example.com",
    password: hashedPassword,
    role: "lawyer",
    barCouncilNumber: "GUJ/54321/2021",
    phone: "+91 9876543226",
  },
  {
    firstName: "Sneha",
    lastName: "Nair",
    email: "lawyer4@example.com",
    password: hashedPassword,
    role: "lawyer",
    barCouncilNumber: "KER/78901/2020",
    phone: "+91 9876543227",
  },
  {
    firstName: "Rohit",
    lastName: "Rao",
    email: "lawyer5@example.com",
    password: hashedPassword,
    role: "lawyer",
    barCouncilNumber: "KAR/56789/2019",
    phone: "+91 9876543228",
  },
  {
    firstName: "Pooja",
    lastName: "Jain",
    email: "lawyer6@example.com",
    password: hashedPassword,
    role: "lawyer",
    barCouncilNumber: "RAJ/12398/2022",
    phone: "+91 9876543229",
  },
  {
    firstName: "Arjun",
    lastName: "Yadav",
    email: "lawyer7@example.com",
    password: hashedPassword,
    role: "lawyer",
    barCouncilNumber: "UP/10101/2021",
    phone: "+91 9876543230",
  },
  {
    firstName: "Divya",
    lastName: "Rathore",
    email: "lawyer8@example.com",
    password: hashedPassword,
    role: "lawyer",
    barCouncilNumber: "PUN/40404/2018",
    phone: "+91 9876543231",
  },
  {
    firstName: "Siddharth",
    lastName: "Kapoor",
    email: "lawyer9@example.com",
    password: hashedPassword,
    role: "lawyer",
    barCouncilNumber: "DEL/30303/2017",
    phone: "+91 9876543232",
  },
  {
    firstName: "Ananya",
    lastName: "Gupta",
    email: "lawyer10@example.com",
    password: hashedPassword,
    role: "lawyer",
    barCouncilNumber: "MP/20202/2016",
    phone: "+91 9876543233",
  },
]);

// Create applicants (users)
const applicants = await User.insertMany([
  {
    firstName: "Rahul",
    lastName: "Kumar",
    email: "user1@example.com",
    password: hashedPassword,
    role: "user",
    phone: "+91 9876543214",
    address: "123, ABC Colony, New Delhi - 110001",
  },
  {
    firstName: "Sunil",
    lastName: "Verma",
    email: "user2@example.com",
    password: hashedPassword,
    role: "user",
    phone: "+91 9876543215",
    address: "456, XYZ Society, Mumbai - 400001",
  },
  {
    firstName: "Priya",
    lastName: "Sharma",
    email: "user3@example.com",
    password: hashedPassword,
    role: "user",
    phone: "+91 9876543216",
    address: "789, PQR Apartments, Bangalore - 560001",
  },
  {
    firstName: "Vikram",
    lastName: "Patel",
    email: "user4@example.com",
    password: hashedPassword,
    role: "user",
    phone: "+91 9876543217",
    address: "101, LMN Heights, Chennai - 600001",
  },
  {
    firstName: "Deepa",
    lastName: "Joshi",
    email: "user5@example.com",
    password: hashedPassword,
    role: "user",
    phone: "+91 9876543234",
    address: "234, Rainbow Nagar, Pune - 411001",
  },
  {
    firstName: "Manoj",
    lastName: "Reddy",
    email: "user6@example.com",
    password: hashedPassword,
    role: "user",
    phone: "+91 9876543235",
    address: "321, Lake View Road, Hyderabad - 500001",
  },
  {
    firstName: "Ankita",
    lastName: "Chatterjee",
    email: "user7@example.com",
    password: hashedPassword,
    role: "user",
    phone: "+91 9876543236",
    address: "654, Eco Green, Kolkata - 700001",
  },
  {
    firstName: "Gaurav",
    lastName: "Bansal",
    email: "user8@example.com",
    password: hashedPassword,
    role: "user",
    phone: "+91 9876543237",
    address: "678, Hill Crest, Jaipur - 302001",
  },
  {
    firstName: "Kiran",
    lastName: "Nath",
    email: "user9@example.com",
    password: hashedPassword,
    role: "user",
    phone: "+91 9876543238",
    address: "202, Sun City, Ahmedabad - 380001",
  },
  {
    firstName: "Tanvi",
    lastName: "Deshmukh",
    email: "user10@example.com",
    password: hashedPassword,
    role: "user",
    phone: "+91 9876543239",
    address: "303, Galaxy Town, Nagpur - 440001",
  },
  {
    firstName: "Rakesh",
    lastName: "Jain",
    email: "user11@example.com",
    password: hashedPassword,
    role: "user",
    phone: "+91 9876543240",
    address: "501, Green Fields, Lucknow - 226001",
  },
  {
    firstName: "Smita",
    lastName: "Iyer",
    email: "user12@example.com",
    password: hashedPassword,
    role: "user",
    phone: "+91 9876543241",
    address: "706, Palm Enclave, Kochi - 682001",
  },
  {
    firstName: "Harshit",
    lastName: "Aggarwal",
    email: "user13@example.com",
    password: hashedPassword,
    role: "user",
    phone: "+91 9876543242",
    address: "908, Sky Residency, Chandigarh - 160001",
  },
  {
    firstName: "Meenal",
    lastName: "Bhatt",
    email: "user14@example.com",
    password: hashedPassword,
    role: "user",
    phone: "+91 9876543243",
    address: "119, Classic Towers, Bhopal - 462001",
  },
  {
    firstName: "Nikhil",
    lastName: "Tripathi",
    email: "user15@example.com",
    password: hashedPassword,
    role: "user",
    phone: "+91 9876543244",
    address: "220, River Side, Kanpur - 208001",
  },
  {
    firstName: "Ayesha",
    lastName: "Ansari",
    email: "user16@example.com",
    password: hashedPassword,
    role: "user",
    phone: "+91 9876543245",
    address: "333, Crescent Road, Srinagar - 190001",
  },
  {
    firstName: "Parth",
    lastName: "Shukla",
    email: "user17@example.com",
    password: hashedPassword,
    role: "user",
    phone: "+91 9876543246",
    address: "444, Sea View, Surat - 395001",
  },
  {
    firstName: "Rekha",
    lastName: "Mohan",
    email: "user18@example.com",
    password: hashedPassword,
    role: "user",
    phone: "+91 9876543247",
    address: "555, Lotus Garden, Thiruvananthapuram - 695001",
  },
  {
    firstName: "Farhan",
    lastName: "Khan",
    email: "user19@example.com",
    password: hashedPassword,
    role: "user",
    phone: "+91 9876543248",
    address: "666, Peace Avenue, Patna - 800001",
  },
  {
    firstName: "Ritika",
    lastName: "Shah",
    email: "user20@example.com",
    password: hashedPassword,
    role: "user",
    phone: "+91 9876543249",
    address: "777, Diamond Valley, Indore - 452001",
  },
]);


    // Sample data for cases
    const courts = [
      "Sessions Court, Delhi",
      "High Court, Mumbai",
      "District Court, Bangalore",
      "District Court, Chennai",
    ];
    const offenseTypes = ["bailable", "non-bailable"];
    const sections = [
      ["302", "307"], // Murder, Attempt to murder
      ["376"], // Sexual assault
      ["420"], // Cheating
      ["323"], // Voluntarily causing hurt
    ];
    const allegations = [
      "Accused of murder",
      "Accused of attempt to murder",
      "Accused of sexual assault",
      "Accused of cheating",
      "Accused of voluntarily causing hurt",
    ];
    const custodyStatuses = [
      "Police Custody",
      "Judicial Custody",
      "Not Arrested",
    ];
    const statuses = ["Pending", "Scheduled", "Approved", "Rejected"];
    const dcmCategories = ["Standard", "Complex", "Expedited"];

    // Create cases
    const cases = [];
    for (let i = 0; i < 10; i++) {
      const applicant = getRandomElement(applicants);
      const defendant = getRandomElement(applicants);
      const lawyer = getRandomElement(lawyers);
      const judge = getRandomElement(judges);
      const court = getRandomElement(courts);
      const offenseType = getRandomElement(offenseTypes);
      const sectionGroup = getRandomElement(sections);
      const allegation = getRandomElement(allegations);
      const custodyStatus = getRandomElement(custodyStatuses);
      const status = getRandomElement(statuses);
      const dcmCategory = getRandomElement(dcmCategories);

      const filingDate = randomDate(new Date(2022, 0, 1), new Date());
      const arrestDate = randomDate(new Date(2021, 0, 1), filingDate);

      const caseNumber = `C-${i + 1}/${filingDate.getFullYear()}`;

      const newCase = new Case({
        caseNumber,
        applicant: applicant._id,
        defendant: defendant._id,
        lawyer: lawyer._id,
        court,
        judge: judge._id,
        filingDate,
        status,
        offenseType,
        sections: sectionGroup,
        allegations: allegation,
        arrestDate,
        custodyStatus,
        custodyPeriod: Math.floor(Math.random() * 180) + 10, // 10-190 days
        bailGrounds: "No prior criminal record",
        previousBailApplications: Math.floor(Math.random() * 3),
        proposedBailConditions: [
          "Regular reporting to police station",
          "Surrender of passport",
        ],
        dcmCategory,
        updates: [
          {
            date: filingDate,
            description: "Case filed",
            updatedBy: lawyer._id,
          },
        ],
      });

      const savedCase = await newCase.save();
      cases.push(savedCase);
    }

    // Create hearings for each case
    for (const caseItem of cases) {
      const hearingCount = Math.floor(Math.random() * 3) + 1; // 1-3 hearings

      for (let j = 0; j < hearingCount; j++) {
        const hearingDate = randomDate(
          caseItem.filingDate,
          new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
        ); // Up to 30 days in future
        const hearingStatus =
          hearingDate < new Date()
            ? getRandomElement(["Completed", "Adjourned"])
            : "Scheduled";

        const hearing = new Hearing({
          caseId: caseItem._id,
          date: hearingDate,
          time: `${Math.floor(Math.random() * 8) + 10}:${
            Math.random() > 0.5 ? "00" : "30"
          } ${Math.random() > 0.5 ? "AM" : "PM"}`,
          court: caseItem.court,
          judge: caseItem.judge,
          status: hearingStatus,
          purpose: "Hearing for case progress",
          notes:
            hearingStatus === "Completed"
              ? "Hearing completed as scheduled"
              : "",
          outcome:
            hearingStatus === "Completed"
              ? caseItem.status === "Approved"
                ? "Case approved"
                : caseItem.status === "Rejected"
                ? "Case rejected"
                : ""
              : "",
          attendees: [
            {
              user: caseItem.applicant,
              role: "Applicant",
              attended: hearingStatus === "Completed",
            },
            {
              user: caseItem.lawyer,
              role: "Lawyer",
              attended: hearingStatus === "Completed",
            },
            {
              user: caseItem.judge,
              role: "Judge",
              attended: hearingStatus === "Completed",
            },
          ],
        });

        const savedHearing = await hearing.save();

        // Update case with hearing reference
        caseItem.hearings.push(savedHearing._id);
        await caseItem.save();
      }
    }

    console.log(
      "Seed data for users, cases, and hearings created successfully"
    );
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
};

module.exports = seedData;