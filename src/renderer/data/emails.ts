export type EmailAccount = "Personal" | "Work";

export interface EmailItem {
  id: string;
  account: EmailAccount;
  sender: string;
  unread: boolean;
  subject: string;
  preview: string;
  body: string;
}

export const emails: EmailItem[] = [
  {
    id: "e1",
    account: "Work",
    sender: "JPMC Onboarding Team",
    unread: true,
    subject: "Software Engineer Program — next steps",
    preview: "Welcome again to the 2027 cohort, here's what to expect before your Feb start date...",
    body:
      "Welcome again to the 2027 cohort! Here's what to expect before your February start date:\n\n" +
      "1. Background check paperwork is due by the end of the month.\n" +
      "2. Equipment shipping — confirm your mailing address in Workday.\n" +
      "3. Orientation week runs your first Mon–Fri, remote.\n\n" +
      "Reach out to this inbox if anything comes up before then. Looking forward to having you on the team!",
  },
  {
    id: "e2",
    account: "Personal",
    sender: "Dad",
    unread: true,
    subject: "Booking calendar for next week",
    preview: "Can you check the rent-a-taxi dashboard when you get a sec...",
    body:
      "Hey, can you check the rent-a-taxi dashboard when you get a sec? " +
      "I've got two bookings that might overlap on Thursday and I don't want to double-book the car. " +
      "Also, call me when you're free — wanted to ask about the garage rental too.",
  },
  {
    id: "e3",
    account: "Personal",
    sender: "Garmin Connect",
    unread: true,
    subject: "Your weekly summary is ready",
    preview: "Here's how last week's activity compared...",
    body:
      "Here's how last week's activity compared to the week before:\n\n" +
      "Steps: up 8%\nSleep: down 12%\nResting heart rate: unchanged\n\n" +
      "Your body battery has been trending lower in the mornings — consider an earlier bedtime this week.",
  },
  {
    id: "e4",
    account: "Personal",
    sender: "LinkedIn",
    unread: false,
    subject: "3 people viewed your profile",
    preview: "See who's been checking out your profile this week...",
    body:
      "See who's been checking out your profile this week. " +
      "Upgrade to Premium to see all 3 people who viewed your profile, plus how you compare to other applicants.",
  },
];
