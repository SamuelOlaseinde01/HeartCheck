async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function predictRisk(patientData) {
  await sleep(1000);
  const res = await fetch("http://127.0.0.1:8000/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patientData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw data;
  }
  return data;
}
