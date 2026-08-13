import useSWR from "swr";

async function fetchStatus(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedData />
    </>
  );
}

function UpdatedData() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchStatus, {
    refreshInterval: 2000,
  });
  let updatedAtText = "Carregando...";
  let dataStatus;
  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
    dataStatus = data.dependencies.database;
  }

  return (
    <>
      <div>Última atualização {updatedAtText}</div>
      <h2>Dados do servidor:</h2>
      {dataStatus && (
        <div>
          <div>Versão: {dataStatus.version}</div>
          <div>Max_connections: {dataStatus.max_connections}</div>
          <div>Conexões em uso: {dataStatus.used_connections}</div>
        </div>
      )}
    </>
  );
}
