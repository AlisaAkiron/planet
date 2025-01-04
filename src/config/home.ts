import { Home } from './types/home'

const home: Home = {
  intro: {
    heading: [
      {
        type: 'h1',
        text: "Hi, I'm ",
        class: 'font-light text-4xl',
      },
      {
        type: 'h1',
        text: 'Alisa',
        class: 'font-medium mx-2 text-4xl',
      },
      {
        type: 'h1',
        text: '👋。',
        class: 'font-light text-4xl',
      },
    ],
    description: [
      {
        type: 'span',
        text: 'Backend Developer',
        class: 'text-lg',
      },
      {
        type: 'span',
        text: 'System Administrator',
        class: 'text-lg',
      },
    ],
    socialMedia: [
      {
        url: 'https://space.bilibili.com/5627849',
        icon: 'bilibili',
        color: '#00A1D6',
        tooltip: '@Alisa_Akiron',
      },
      {
        url: 'https://github.com/AlisaAkiron',
        icon: 'github',
        color: '#181818',
        tooltip: '@AlisaAkiron',
      },
      {
        url: 'mailto:alisa@alisaqaq.moe',
        icon: 'envelope',
        color: '#D44638',
        tooltip: 'alisa@alisaqaq.moe',
      },
      {
        url: 'https://git.alisaqaq.moe',
        icon: 'gitlab',
        color: '#FC6D26',
        tooltip: 'Alisa Lab Codebin',
      },
    ],
  },
}

export default home
