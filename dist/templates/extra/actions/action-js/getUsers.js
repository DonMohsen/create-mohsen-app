"use server";

export async function getUsers() {
  const res = await fetch("https://randomuser.me/api/?results=5");

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await res.json();
  return data.results;
}
