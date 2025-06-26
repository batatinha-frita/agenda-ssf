// Test script to verify the appointment times fix
console.log("Testing appointment times fix...");

// This script simulates the issue we fixed:
// The problem was that generateAvailableTimes() was called immediately after setExistingAppointments()
// but state updates are asynchronous, so the function was using stale data.

// Simulate the old problematic flow:
console.log("\n=== OLD (BROKEN) FLOW ===");
let existingAppointments = [];

function setExistingAppointments(newAppointments) {
  // Simulate React's asynchronous state update
  setTimeout(() => {
    existingAppointments = newAppointments;
    console.log("State updated (async):", existingAppointments);
  }, 0);
}

function generateAvailableTimes() {
  console.log("generateAvailableTimes called with:", existingAppointments);
  return existingAppointments; // This would be stale data
}

// Simulate the old fetchExistingAppointments
function oldFetchExistingAppointments() {
  const fetchedData = ["2024-01-15T09:00:00", "2024-01-15T10:30:00"];
  console.log("Fetched appointments:", fetchedData);

  setExistingAppointments(fetchedData);
  const result = generateAvailableTimes(); // Called immediately - PROBLEM!
  console.log("Generated times (old way):", result);
}

oldFetchExistingAppointments();

// Simulate the new fixed flow:
console.log("\n=== NEW (FIXED) FLOW ===");
let existingAppointmentsFixed = [];

function setExistingAppointmentsFixed(newAppointments) {
  setTimeout(() => {
    existingAppointmentsFixed = newAppointments;
    console.log("State updated (async):", existingAppointmentsFixed);
    // In React, this would trigger the useEffect
    generateAvailableTimesFixed();
  }, 0);
}

function generateAvailableTimesFixed() {
  console.log(
    "generateAvailableTimesFixed called with:",
    existingAppointmentsFixed,
  );
  return existingAppointmentsFixed; // This now has the correct data
}

// Simulate the new fetchExistingAppointments
function newFetchExistingAppointments() {
  const fetchedData = ["2024-01-15T09:00:00", "2024-01-15T10:30:00"];
  console.log("Fetched appointments:", fetchedData);

  setExistingAppointmentsFixed(fetchedData);
  // generateAvailableTimes is now called by useEffect when state changes
  console.log("Generated times (new way): will be called by useEffect");
}

newFetchExistingAppointments();

setTimeout(() => {
  console.log("\n=== SUMMARY ===");
  console.log("The fix ensures that generateAvailableTimes() is called AFTER");
  console.log("the existingAppointments state has been properly updated,");
  console.log(
    "using a useEffect that depends on the existingAppointments array.",
  );
}, 100);
