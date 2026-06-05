async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function predictRisk(patientData) {
  await sleep(1000);
  const res = await fetch("https://heartcheck-mhyg.onrender.com/predict", {
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
