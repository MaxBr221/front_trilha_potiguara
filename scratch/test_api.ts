import { api } from '../src/services/api';

async function test() {
  const conteudos = await api.get('/conteudos');
  console.log('Todos conteudos:', conteudos.data);
  const licoesConteudos = await api.get('/conteudos/licoes/1');
  console.log('Licao 1 conteudos:', licoesConteudos.data);
}
test();
