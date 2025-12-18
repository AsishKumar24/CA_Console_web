// types/members.ts
export type Socials = {
  github?: string;
  linkedin?: string;
  instagram?: string;
};

export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  socials?: Socials;
};

export const members: Member[] = [
  {
    id: "1",
    firstName: "Aditya",
    lastName: "Sarkar",
    role: "Team Member",
    email: "2230006@kiit.ac.in",
    bio: "Frontend Developer",
    avatarUrl: "/images/members/AdityaSarkar.jpg",
    socials: {
      github: "https://www.facebook.com/PimjoHQ",
      linkedin: "https://www.linkedin.com/company/pimjo",
      instagram: "https://instagram.com/asishkumar.24",
    },
  },
  {
    id: "2",
    firstName: "Akash",
    lastName: "Kumar",
    role: "Team Member",
    email: "2230008@kiit.ac.in",
    bio: "ML Engineer",
    avatarUrl: "/images/members/AkashKumar.jpg",
    socials: {
      github: "https://www.facebook.com/PimjoHQ",
      linkedin: "https://www.linkedin.com/company/pimjo",
      instagram: "https://instagram.com/PimjoHQ",
    },
  },
  {
    id: "3",
    firstName: "Ashmit",
    lastName: "Dutta",
    role: "Team Member",
    email: "2230156@kiit.ac.in",
    bio: "Backend Developer",
    avatarUrl: "/images/members/AshmitDutta.jpg",
    socials: {
       github: "https://www.facebook.com/PimjoHQ",
      linkedin: "https://www.linkedin.com/company/pimjo",
      instagram: "https://instagram.com/PimjoHQ",
    },
  },
  {
    id: "4",
    firstName: "Asish",
    lastName: "Kumar",
    role: "Team Member",
    email: "2230240@kiit.ac.in",
    bio: "Full Stack Developer",
    avatarUrl: "/images/members/AsishKumar.jpg",
    socials: {
       github: "https://github.com/AsishKumar24",
      linkedin: "https://www.linkedin.com/in/k-asish-kumar-b38ab0215/",
      instagram: "https://instagram.com/PimjoHQ",
    },
  },
];
