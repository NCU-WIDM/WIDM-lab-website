const headerNavLinks = [
  { title: 'Home', href: '/' },
  { title: 'Advisor', href: '/advisor' },
  { 
    title: 'News',
    href: '/news',
    dropdown: [
      { title: 'External Award', href: '/news' },
      { title: 'School Award', href: '/news' },
      { title: 'Seminar', href: '/news' },
      { title: 'Undergraduate Research Project Scholarship', href: '/news' },
      { title: 'Other', href: '/news' },
    ],
  },
  { title: 'Project', href: '/project' },
  {
    title: 'Papers',
    href: '/papers',
    dropdown: [
      { title: 'Thesis Advised', href: '/thesis-advised' },
      { title: 'Publication', href: '/publication' },
    ],
  },
  { title: 'Members', href: '/members' },
  { title: 'Activity', href: '/activity' },
]

export default headerNavLinks
