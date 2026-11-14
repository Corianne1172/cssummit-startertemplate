/**
 * Profile shape and the seeded demo profiles. Every profile here is fake.
 *
 * Field names follow the team's match formula (see lib/matcher.ts). No last names, photos,
 * contact details or identity attributes are stored.
 */

export type Profile = {
  id: string;
  role: "mentor" | "mentee";
  /** First name only. */
  name: string;
  /** Short line under the name, e.g. "Network technician". */
  title: string;
  neighborhood: string;
  bio: string;
  interests: string[];
  skills: string[];
  /** What a mentee wants to learn. Empty for mentors. */
  needs: string[];
  careerGoals: string[];
  educationLevel: string;
  /** Mentors: how they mentor. Mentees: the style they prefer. */
  mentorshipStyle: string[];
  availability: string[];
};

/** The demo opens as this mentee. There is no login. */
export const DEMO_MENTEE_ID = "maya";

const mentor = (
  id: string,
  name: string,
  title: string,
  neighborhood: string,
  bio: string,
  rest: Pick<
    Profile,
    | "interests"
    | "skills"
    | "careerGoals"
    | "educationLevel"
    | "mentorshipStyle"
    | "availability"
  >,
): Profile => ({
  id,
  role: "mentor",
  name,
  title,
  neighborhood,
  bio,
  needs: [],
  ...rest,
});

export const SEED_PROFILES: Profile[] = [
  {
    id: DEMO_MENTEE_ID,
    role: "mentee",
    name: "Maya",
    title: "Community college student",
    neighborhood: "South Chicago",
    bio: "Second-year student who grew up near the old South Works site. Wants a job at the new quantum park.",
    interests: ["quantum computing", "software", "data science"],
    skills: ["Python", "customer service"],
    needs: ["quantum basics", "SQL", "interviewing"],
    careerGoals: ["quantum technician", "data analyst"],
    educationLevel: "Community college",
    mentorshipStyle: ["structured", "hands-on"],
    availability: ["Weekday evenings", "Saturday"],
  },
  {
    id: "jordan",
    role: "mentee",
    name: "Jordan",
    title: "High school senior",
    neighborhood: "South Shore",
    bio: "Likes building things and wants a paid apprenticeship after graduation.",
    interests: ["construction", "infrastructure"],
    skills: ["teamwork"],
    needs: ["blueprint reading", "safety certification", "resume writing"],
    careerGoals: ["construction apprentice"],
    educationLevel: "High school",
    mentorshipStyle: ["hands-on"],
    availability: ["Saturday", "Sunday"],
  },
  {
    id: "tasha",
    role: "mentee",
    name: "Tasha",
    title: "Career switcher from retail",
    neighborhood: "Chatham",
    bio: "Ten years in retail management. Studying for a first IT certification at night.",
    interests: ["cybersecurity", "software"],
    skills: ["customer service", "project management"],
    needs: ["networking", "Linux", "interviewing"],
    careerGoals: ["security analyst"],
    educationLevel: "High school",
    mentorshipStyle: ["structured", "collaborative"],
    availability: ["Weekday evenings"],
  },
  {
    id: "devon",
    role: "mentee",
    name: "Devon",
    title: "Line cook",
    neighborhood: "Pullman",
    bio: "Wants to run a catering business that serves the new campus.",
    interests: ["hospitality", "facilities"],
    skills: ["customer service", "teamwork"],
    needs: ["project management", "resume writing"],
    careerGoals: ["start a business"],
    educationLevel: "High school",
    mentorshipStyle: ["independent"],
    availability: ["Weekday lunch", "Sunday"],
  },
  mentor(
    "aaliyah",
    "Aaliyah",
    "Quantum lab technician",
    "Hyde Park",
    "Started at a community college and now keeps lab cooling systems running. Happy to explain what the job is really like.",
    {
      interests: ["quantum computing", "infrastructure"],
      skills: ["quantum basics", "Python", "safety certification"],
      careerGoals: ["quantum technician"],
      educationLevel: "Community college",
      mentorshipStyle: ["structured", "hands-on"],
      availability: ["Weekday evenings", "Saturday"],
    },
  ),
  mentor(
    "marcus",
    "Marcus",
    "Data analyst",
    "South Chicago",
    "Self-taught in SQL after working a warehouse job. Runs mock interviews for first-time applicants.",
    {
      interests: ["data science", "software"],
      skills: ["SQL", "Python", "statistics", "interviewing"],
      careerGoals: ["data analyst"],
      educationLevel: "Community college",
      mentorshipStyle: ["structured", "collaborative"],
      availability: ["Saturday", "Sunday"],
    },
  ),
  mentor(
    "priya",
    "Priya",
    "Quantum software researcher",
    "Hyde Park",
    "Writes software for quantum hardware. Likes helping people get past the scary vocabulary.",
    {
      interests: ["quantum computing", "software", "AI"],
      skills: ["quantum basics", "Python", "Linux"],
      careerGoals: ["quantum technician", "software engineer"],
      educationLevel: "PhD",
      mentorshipStyle: ["collaborative"],
      availability: ["Weekday evenings"],
    },
  ),
  mentor(
    "andre",
    "Andre",
    "Software engineer",
    "Bronzeville",
    "Bootcamp graduate, eight years in web development. Reviews resumes and portfolios.",
    {
      interests: ["software", "AI"],
      skills: ["Python", "SQL", "cloud", "resume writing", "interviewing"],
      careerGoals: ["software engineer"],
      educationLevel: "Bachelors",
      mentorshipStyle: ["independent", "collaborative"],
      availability: ["Weekday evenings", "Sunday"],
    },
  ),
  mentor(
    "keisha",
    "Keisha",
    "Security analyst",
    "Chatham",
    "Moved from help desk to a security operations team. Knows which certifications are worth the money.",
    {
      interests: ["cybersecurity", "software"],
      skills: ["networking", "Linux", "interviewing"],
      careerGoals: ["security analyst"],
      educationLevel: "Bachelors",
      mentorshipStyle: ["structured"],
      availability: ["Weekday evenings"],
    },
  ),
  mentor(
    "luis",
    "Luis",
    "Union carpenter",
    "South Deering",
    "Twenty years on job sites. Helps young people apply for apprenticeships.",
    {
      interests: ["construction", "infrastructure"],
      skills: ["blueprint reading", "safety certification", "teamwork"],
      careerGoals: ["construction apprentice"],
      educationLevel: "Apprenticeship",
      mentorshipStyle: ["hands-on"],
      availability: ["Saturday", "Sunday"],
    },
  ),
  mentor(
    "renee",
    "Renee",
    "Civil engineer",
    "Beverly",
    "Works on site preparation and roads. Mentors students thinking about engineering school.",
    {
      interests: ["civil engineering", "construction", "infrastructure"],
      skills: ["blueprint reading", "project management", "statistics"],
      careerGoals: ["civil engineer"],
      educationLevel: "Masters",
      mentorshipStyle: ["structured"],
      availability: ["Weekday lunch", "Saturday"],
    },
  ),
  mentor(
    "omar",
    "Omar",
    "Network technician",
    "South Shore",
    "Installs and maintains campus networks. Started as a cable installer.",
    {
      interests: ["infrastructure", "cybersecurity"],
      skills: ["networking", "Linux", "safety certification"],
      careerGoals: ["security analyst", "quantum technician"],
      educationLevel: "Community college",
      mentorshipStyle: ["hands-on", "structured"],
      availability: ["Weekday evenings", "Saturday"],
    },
  ),
  mentor(
    "simone",
    "Simone",
    "Catering business owner",
    "Pullman",
    "Built a catering company from a home kitchen. Teaches bidding for corporate contracts.",
    {
      interests: ["hospitality", "facilities"],
      skills: ["project management", "customer service", "resume writing"],
      careerGoals: ["start a business"],
      educationLevel: "High school",
      mentorshipStyle: ["independent", "collaborative"],
      availability: ["Weekday lunch", "Sunday"],
    },
  ),
  mentor(
    "walter",
    "Walter",
    "Facilities manager",
    "Roseland",
    "Runs building operations for a research campus. Hires custodial and maintenance staff.",
    {
      interests: ["facilities", "infrastructure"],
      skills: ["project management", "safety certification", "interviewing"],
      careerGoals: ["facilities manager"],
      educationLevel: "Community college",
      mentorshipStyle: ["structured", "hands-on"],
      availability: ["Saturday"],
    },
  ),
  mentor(
    "nia",
    "Nia",
    "AI product manager",
    "Woodlawn",
    "Works between engineers and customers. Helps people tell their story in interviews.",
    {
      interests: ["AI", "data science", "software"],
      skills: ["project management", "interviewing", "resume writing", "SQL"],
      careerGoals: ["data analyst", "software engineer"],
      educationLevel: "Masters",
      mentorshipStyle: ["collaborative", "structured"],
      availability: ["Weekday evenings", "Saturday"],
    },
  ),
  mentor(
    "terrence",
    "Terrence",
    "Community college instructor",
    "Englewood",
    "Teaches intro programming and statistics. Knows the local training programs well.",
    {
      interests: ["data science", "quantum computing", "software"],
      skills: ["Python", "statistics", "quantum basics", "SQL"],
      careerGoals: ["data analyst", "quantum technician"],
      educationLevel: "Masters",
      mentorshipStyle: ["structured", "hands-on"],
      availability: ["Weekday evenings", "Saturday"],
    },
  ),
];
