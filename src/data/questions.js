export const categoryData = [
  {
    categoryId: 'general',
    name: 'General Knowledge',
    colour: '#377cf6',
    questions: [
      {
        questionId: 'general-1',
        prompt: 'What is the capital city of New Zealand?',
        options: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton'],
        correctAnswer: 'Wellington',
      },
      {
        questionId: 'general-2',
        prompt: 'How many continents are there on Earth?',
        options: ['Five', 'Six', 'Seven', 'Eight'],
        correctAnswer: 'Seven',
      },
      {
        questionId: 'general-3',
        prompt: 'Which is the largest ocean on Earth?',
        options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
        correctAnswer: 'Pacific',
      },
    ],
  },
  {
    categoryId: 'science',
    name: 'Science',
    colour: '#16a673',
    questions: [
      {
        questionId: 'science-1',
        prompt: 'Which planet is the largest in our solar system?',
        options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 'Jupiter',
      },
      {
        questionId: 'science-2',
        prompt: 'What gas do plants absorb during photosynthesis?',
        options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'],
        correctAnswer: 'Carbon dioxide',
      },
      {
        questionId: 'science-3',
        prompt: 'At sea level, water freezes at what temperature?',
        options: ['0°C', '10°C', '32°C', '100°C'],
        correctAnswer: '0°C',
      },
    ],
  },
  {
    categoryId: 'technology',
    name: 'Technology',
    colour: '#7b52df',
    questions: [
      {
        questionId: 'technology-1',
        prompt: 'Which language is commonly used to add interactivity to websites?',
        options: ['HTML', 'CSS', 'JavaScript', 'SQL'],
        correctAnswer: 'JavaScript',
      },
      {
        questionId: 'technology-2',
        prompt: 'Which symbol starts an ID selector in CSS?',
        options: ['.', '#', '*', '@'],
        correctAnswer: '#',
      },
      {
        questionId: 'technology-3',
        prompt: 'What does API stand for?',
        options: [
          'Application Programming Interface',
          'Automated Program Input',
          'Applied Processing Index',
          'Application Page Integration',
        ],
        correctAnswer: 'Application Programming Interface',
      },
    ],
  },
  {
    categoryId: 'sport',
    name: 'Sport',
    colour: '#ef7b2d',
    questions: [
      {
        questionId: 'sport-1',
        prompt: 'How many players from one team are on the field in football?',
        options: ['Nine', 'Ten', 'Eleven', 'Twelve'],
        correctAnswer: 'Eleven',
      },
      {
        questionId: 'sport-2',
        prompt: 'How many points is a try worth in rugby union?',
        options: ['Three', 'Four', 'Five', 'Six'],
        correctAnswer: 'Five',
      },
      {
        questionId: 'sport-3',
        prompt: 'How many rings are shown on the Olympic symbol?',
        options: ['Four', 'Five', 'Six', 'Seven'],
        correctAnswer: 'Five',
      },
    ],
  },
]
