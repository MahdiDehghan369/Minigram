const Mehti = require("Mehti-Dehghan");

const aboutMe = new Mehti.Aboute();

aboutMe.setProfile({
  fullName: "Mehti Dehghan",
  role: "Backend Developer",
  location: {
    country: "Iran",
    city: "Mashhad",
  },
  techStack: [
    "JavaScript",
    "Node.js",
    "Express",
    "Mysql",
    "SQL",
    "Html",
    "Postman",
  ],
  birthDay: [2006 , "Sepyember 7", "Thursday"],
  myHobbies: ["Music", "Podcast", "Learning", "Coding"],
  currently:
    "Right now, I'm building portfolio projects to level up my coding skills and strengthen my dev journey 🚀",
});

aboutMe.getGoals();

// => [
//   "Become a professional backend developer",
// ]

aboutMe.connect({
  github: "https://github.com/MahdiDehghan369",
  telegram: "https://t.me/silay369",
  email: "silayprogramming@gmail.com",
});
