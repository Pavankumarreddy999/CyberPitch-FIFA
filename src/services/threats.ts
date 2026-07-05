// Fetch all threats
export async function fetchThreats() {
  const response = await fetch("/api/threats");
  if (!response.ok) {
    throw new Error("Failed to fetch threats");
  }
  return response.json();
}

// Submit a new threat
export async function submitThreat(threatData: any) {
  const response = await fetch("/api/threats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(threatData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to submit threat");
  }
  
  return response.json();
}

// Delete a threat
export async function deleteThreat(id: string) {
  const response = await fetch(`/api/threats?id=${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete threat");
  }
  
  return response.json();
}