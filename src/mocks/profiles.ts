import ProfileInterface from '../interfaces/profile';

const profiles: ProfileInterface[] = [
  {
    id: '0001',
    user_name: 'felipe.ogoms',
    name: 'Felipe Gomes',
    description: 'The sky over the harbor was the color of television tuned to an offline channel.',
    likes: ['LoL', 'Ficção', 'Romance', 'Cyberpunk', 'Cyber', 'Tecnologia', 'Fanfic'],
    latest_readings: [
      'Jogador N1',
      'Tartarugas até lá em baixo',
      'Alice no pais das maravilhas',
      'Até a próxima estrela',
    ],
    photo:
      'https://instagram.ffor29-1.fna.fbcdn.net/v/t51.2885-19/151841773_141305464507911_2460237208396643498_n.jpg?stp=dst-jpg_s150x150',
    password: 'senha',
    email: 'felipe@bookadinho.com',
    isActive: true,
    authorizations: [
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDEiLCJ1c2VyX25hbWUiOiJmZWxpcGUub2dvbXMiLCJpYXQiOjE2ODA4OTA3ODN9.oVKj9p86GK7OYg4OTCpKeuloa_A4gcIgjtAdRkXn2P4',
    ],
  },
  {
    id: '0002',
    name: 'Guarany',
    user_name: 'guaranolas',
    description: 'Programador e tranquilo com a vida',
    likes: ['Computador', 'Jogos', 'Animes', 'Séries'],
    latest_readings: ['Clean code', 'Algoritmos na prática'],
    photo: 'https://thispersondoesnotexist.com/image',
    password: '1234',
    email: 'guaranolas@bookadinho.com',
    isActive: true,
    authorizations: [],
  },
  {
    id: '0003',
    name: 'Carlos',
    user_name: 'case',
    description:
      'Apaixonado por livros e arquitetura. 📷 Gosto de tirar fotos em prédios antigos e abandonas. Amo ver a paisagem do urbana do topo de um prédio!',
    likes: ['Fotografia', 'Livros', 'Urbanismo', 'Animes'],
    latest_readings: ['A arte de projetar em arquitetura'],
    photo: '',
    password: 'password',
    email: 'case@bookadinho.com',
    isActive: true,
    authorizations: [],
  },
  {
    id: '0004',
    name: 'Cynthia',
    user_name: 'paulacynthia',
    description: 'Desenvolvedora front-end e leitora nas horas vagas',
    likes: ['Animes', 'Livros', 'Música', 'Tecnologia'],
    latest_readings: ['As extraordinárias cores do amanhã', 'Rainha Vermelha', 'Até a próxima estrela'],
    photo: '',
    password: 'pc',
    email: 'pc@bookadinho.com',
    isActive: true,
    authorizations: [
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDQiLCJ1c2VyX25hbWUiOiJwYXVsYWN5bnRoaWEiLCJpYXQiOjE2ODA4OTA4MTh9.51hI5jJj2LOkB4kotF8C5MtLPJpTexVqEJza6OlIvMM',
    ],
  },
];

export default profiles;
