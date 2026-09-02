// Core FLAMES algorithm verification test

function calculateFlames(name1, name2) {
  const clean1 = name1.toLowerCase().replace(/[^a-z]/g, '');
  const clean2 = name2.toLowerCase().replace(/[^a-z]/g, '');

  if (!clean1 || !clean2) {
    throw new Error("Both names must contain alphabetic characters.");
  }

  const arr1 = clean1.split('');
  const arr2 = clean2.split('');

  const matches = [];
  const arr1Leftovers = [...arr1];
  const arr2Leftovers = [...arr2];

  for (let i = 0; i < arr1.length; i++) {
    const char = arr1[i];
    const matchIdx = arr2Leftovers.indexOf(char);
    if (matchIdx !== -1) {
      const idxInArr1 = arr1Leftovers.indexOf(char);
      if (idxInArr1 !== -1) {
        arr1Leftovers.splice(idxInArr1, 1);
        arr2Leftovers.splice(matchIdx, 1);
        matches.push(char);
      }
    }
  }

  const leftoversCount = arr1Leftovers.length + arr2Leftovers.length;

  if (leftoversCount === 0) {
    return {
      leftoversCount: 0,
      matches,
      arr1Leftovers,
      arr2Leftovers,
      steps: [],
      winner: { code: 'T', letter: 'T', label: 'Twin Flames / Soulmates', description: 'Perfect mirror match!' }
    };
  }

  const flamesList = [
    { code: 'F', label: 'Friends', emoji: '🤝', title: 'The Ride-or-Die Duo' },
    { code: 'L', label: 'Lovers', emoji: '💖', title: 'Written in the Stars' },
    { code: 'A', label: 'Affectionate', emoji: '🥰', title: 'Sweet Tender Hearts' },
    { code: 'M', label: 'Marriage', emoji: '💍', title: 'Happily Ever After' },
    { code: 'E', label: 'Enemies', emoji: '⚡', title: 'Spicy Frenemies' },
    { code: 'S', label: 'Siblings', emoji: '🤪', title: 'Chaos Twins' }
  ];

  let currentList = [...flamesList];
  let currIndex = 0;
  const eliminationSteps = [];

  while (currentList.length > 1) {
    const removeIndex = (currIndex + (leftoversCount - 1)) % currentList.length;
    const removedItem = currentList[removeIndex];
    eliminationSteps.push({
      round: flamesList.length - currentList.length + 1,
      startIndex: currIndex,
      eliminated: removedItem,
      remainingCount: currentList.length - 1,
      listBefore: currentList.map(item => item.code)
    });
    currentList.splice(removeIndex, 1);
    currIndex = removeIndex % currentList.length;
  }

  return {
    name1: clean1,
    name2: clean2,
    leftoversCount,
    matches,
    arr1Leftovers,
    arr2Leftovers,
    steps: eliminationSteps,
    winner: currentList[0]
  };
}

// Test cases
console.log("=== FLAMES Algorithm Tests ===");

// Test 1: Rohit and Neha
const res1 = calculateFlames("Rohit", "Neha");
console.log("Test 1 (Rohit + Neha): N =", res1.leftoversCount, "Winner =", res1.winner.code, res1.winner.label);
if (res1.leftoversCount !== 7 || res1.winner.code !== 'E') {
  console.error("Test 1 failed!");
  process.exit(1);
}

// Test 2: Sam and Samantha
const res2 = calculateFlames("Sam", "Samantha");
console.log("Test 2 (Sam + Samantha): N =", res2.leftoversCount, "Winner =", res2.winner.code, res2.winner.label);
if (res2.leftoversCount !== 5 || res2.winner.code !== 'F') {
  console.error("Test 2 failed!");
  process.exit(1);
}

// Test 3: Romeo and Juliet
const res3 = calculateFlames("Romeo", "Juliet");
console.log("Test 3 (Romeo + Juliet): N =", res3.leftoversCount, "Winner =", res3.winner.code, res3.winner.label);

// Test 4: Identical names
const res4 = calculateFlames("Alex", "Alex");
console.log("Test 4 (Alex + Alex): N =", res4.leftoversCount, "Winner =", res4.winner.code, res4.winner.label);
if (res4.leftoversCount !== 0 || res4.winner.code !== 'T') {
  console.error("Test 4 failed!");
  process.exit(1);
}

console.log("All algorithm tests passed successfully! ✨");
