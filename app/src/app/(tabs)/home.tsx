import { api } from '../../api';
import { Loading, Screen } from '../../components/ui';
import { useLoad } from '../../useLoad';

export default function Home() {
  const { data } = useLoad(api.getHome);
  return (
    <Screen eyebrow="Minha jornada" title={data ? `Olá, ${data.firstName}` : ' '}>
      {!data && <Loading />}
    </Screen>
  );
}
