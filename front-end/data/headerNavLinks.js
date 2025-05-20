const headerNavLinks = [
  { title: 'Home', href: '/' },
  { title: 'Advisor', href: '/advisor' },
  { title: 'News',href: '/news'},
  { title: 'Project', href: '/project' },
  {
    title: 'Papers',
    href: '/papers',
    dropdown: [
      { title: 'Thesis Advised', href: '/thesis_advised' },
      { title: 'Publication by Year', href: '/publication_by_year' },
    ],
  },
  { title: 'Members', href: '/members' },
  { title: 'Activity', href: '/activity' },
]

export default headerNavLinks
