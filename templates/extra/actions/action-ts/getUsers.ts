"use server";

import { User,RandomUserResponse } from "../types/globals.type";


export async function getUsers(): Promise<User[]> {
  const res = await fetch("https://randomuser.me/api/?results=5");

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  const data: RandomUserResponse = await res.json();
  return data.results;
}