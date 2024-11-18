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
        text: 'Alisa Akiron',
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
        url: 'https://github.com/AlisaAkiron',
        icon: 'FaGithub',
        color: '#181818',
        tooltip: '@AlisaAkiron',
      },
      {
        url: 'https://space.bilibili.com/5627849',
        icon: 'FaBilibili',
        color: '#00A1D6',
        tooltip: '@Alisa_Akiron',
      },
      {
        url: 'mailto:alisa@alisaqaq.moe',
        icon: 'FaEnvelope',
        color: '#D44638',
        tooltip: 'alisa@alisaqaq.moe',
      },
      {
        url: 'https://git.alisaqaq.moe',
        icon: 'FaGitlab',
        color: '#FC6D26',
        tooltip: 'Alisa Lab Codebin',
      },
    ],
  },
}

export default home