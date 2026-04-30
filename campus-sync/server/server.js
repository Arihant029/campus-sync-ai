import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// Institutional Context
const profile = {
    college: "Sri Manakula Vinayagar Engineering College",
    hod: "HOD Mam",
    dept: "Computer Science and Engineering",
    attendance: "85%"
};

app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    const input = message.toLowerCase();
    let reply = "";

    if (input.includes("leave")) {
        reply = `To
The Head of Department,
Department of ${profile.dept},
${profile.college}.

Subject: Application for Leave of Absence

Respected ${profile.hod},

I am writing to formally request a leave of absence for two days starting from tomorrow due to an urgent personal commitment at my hometown.

I currently maintain an attendance record of ${profile.attendance}. I assure you that I will catch up on all the lectures missed during my absence.

Thank you.

Yours obediently,
[Your Name]
Roll No: [Your ID]`;
    } 
    else if (input.includes("bonafide")) {
        reply = `To
The Head of Department,
Department of ${profile.dept},
${profile.college}.

Subject: Request for Bonafide Certificate

Respected ${profile.hod},

I am currently registering for an internship and require a Bonafide Certificate as a part of the mandatory registration process.

Kindly issue the certificate at your earliest convenience.

Thank you.

Yours sincerely,
[Your Name]
Roll No: [Your ID]
Third Year, CSE`;
    }
    else if (input.includes("noc") || input.includes("internship")) {
        reply = `To
The Head of Department,
Department of ${profile.dept},
${profile.college}.

Subject: Request for No Objection Certificate (NOC)

Respected ${profile.hod},

I have been selected for a technical internship opportunity. I kindly request you to provide a No Objection Certificate to allow me to participate in this professional development program.

Thank you for your support.

Yours sincerely,
[Your Name]
Roll No: [Your ID]`;
    }
    else {
        reply = "I am the CampusSync Document Engine. Please click one of the quick actions below to generate a Leave Letter, Bonafide Request, or Internship NOC.";
    }

    setTimeout(() => {
        res.json({ reply });
    }, 800);
});

app.listen(5000, () => console.log("🚀 Automation Suite Live on Port 5000"));