document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");
  const error = document.getElementById("error");
  const backButton = document.getElementById("back-button");
  const simulation = document.getElementById("Simulation");
  let lifts = [];
  let liftQueue = [];
  let isProcessingQueue = false;
  let lastcall = null;

  const screenWidth = window.innerWidth;

  const handleBack = () => {
    form.style.display = "flex";
    backButton.style.display = "none";
    simulation.innerHTML = "";
    liftQueue = [];
    lifts = [];
    isProcessingQueue = false;
  };
  backButton.addEventListener("click", handleBack);

  const createSimulation = (floorCount, liftCount) => {
    simulation.innerHTML = "";
    createFloor(floorCount);
    createLift(liftCount);
  };

  const createFloor = (floorCount) => {
    for (let i = 0; i < floorCount; i++) {
      const floorContainer = document.createElement("div");
      floorContainer.className = "floor-container";
      const upButton = document.createElement("button");
      const downButton = document.createElement("button");
      const floor = document.createElement("div");
      const floorNumber = floorCount - i - 1;
      floor.innerText = `Floor ${floorNumber}`;
      floor.className = "floor-button";
      floor.number = floorNumber;
      downButton.innerText = "Down";
      downButton.classList = "downButton";
      downButton.number = floor.number;
      upButton.innerText = "Up";
      upButton.classList = "upButton";
      upButton.number = floor.number;
      upButton.addEventListener("click", () => handleLiftCall(upButton.number));
      downButton.addEventListener("click", () =>
        handleLiftCall(downButton.number)
      );

      floorContainer.appendChild(floor);
      if (floorNumber != 0) {
        floorContainer.appendChild(downButton);
      }
      if (floorNumber != floorCount - 1) {
        floorContainer.appendChild(upButton);
      }
      simulation.appendChild(floorContainer);
    }
  };

  const createLift = (liftCount) => {
    for (let j = 0; j < liftCount; j++) {
      const lift = document.createElement("div");
      const liftGate = document.createElement("div");
      liftGate.className = "liftGate";
      lift.className = "lift";
      lift.id = j + 1;
      lift.atFloor = 0;
      lift.goingtofloor = null;
      lift.isBusy = false;
      if (screenWidth < 768) {
        lift.style.left = `${(j + 1) * 60}px`;
      } else if (screenWidth > 769 && screenWidth < 1024) {
        lift.style.left = `${(j + 1) * 80}px`;
      } else {
        lift.style.left = `${(j + 1) * 100}px`;
      }
      lift.style.bottom = `10px`;
      lift.appendChild(liftGate);
      simulation.appendChild(lift);
      lifts.push(lift);
    }
  };

  const handleLiftCall = (floorNumber) => {
    if (floorNumber === lastcall) {
      return;
    }

    liftQueue.push(floorNumber);
    lastcall = floorNumber;
    processQueue();
  };

  const processQueue = async () => {
    if (isProcessingQueue || liftQueue.length === 0) {
      return;
    }

    isProcessingQueue = true;

    while (liftQueue.length > 0) {
      const floorNumber = liftQueue.shift();
      const nearestLift = findNearestAvailableLift(floorNumber);

      if (nearestLift) {
        moveLift(nearestLift, floorNumber);
      } else {
        liftQueue.unshift(floorNumber);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    isProcessingQueue = false;
  };

  const findNearestAvailableLift = (floorNumber) => {
    let nearestLift = null;
    let minDistance = Infinity;

    for (const lift of lifts) {
      if (!lift.isBusy) {
        const distance = Math.abs(lift.atFloor - floorNumber);
        if (distance < minDistance) {
          minDistance = distance;
          nearestLift = lift;
        }
      }
    }

    return nearestLift;
  };

  const moveLift = async (lift, floorNumber) => {
    console.log("called ");
    lift.isBusy = true;
    const allLifts = document.querySelectorAll(".lift");
    console.log(allLifts);
    const floorwithlift = [];
    allLifts.forEach((lift, i) => {
      if (lift.goingtofloor === floorNumber) {
        floorwithlift.push(lift);
      }
    });

    if (floorwithlift.length >= 2) {
      lift.isBusy = false;
      return;
    }
    lift.goingtofloor = floorNumber;
    const currentFloor = lift.atFloor;
    const floorsToMove = Math.abs(currentFloor - floorNumber);
    const moveTime = floorsToMove * 2000;

    lift.style.transition = `bottom ${moveTime}ms linear`;
    lift.style.bottom = `${floorNumber * 100 + 10}px`;

    await new Promise((resolve) => setTimeout(resolve, moveTime));

    lift.atFloor = floorNumber;

    const liftGate = lift.querySelector(".liftGate");
    liftGate.style.transition = "width 2.5s";
    liftGate.style.width = "0%";

    await new Promise((resolve) => setTimeout(resolve, 2500));

    liftGate.style.transition = "width 2.5s";
    liftGate.style.width = "100%";

    await new Promise((resolve) => setTimeout(resolve, 2500));

    lift.isBusy = false;
    processQueue();
  };

  function opendoor() {}

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const floorCount = parseInt(document.getElementById("add-floor").value);
    const liftCount = parseInt(document.getElementById("add-lift").value);

    if (floorCount <= 0 || liftCount <= 0) {
      error.innerText = "Floor and lift both should be greater than 0";
    } else if (
      (screenWidth < 768 && liftCount > 5) ||
      (screenWidth >= 768 && screenWidth < 1024 && liftCount > 7)
    ) {
      error.innerText =
        "On mobile and tablet, lift count cannot be more than 5 or 7 respectively";
    } else {
      error.innerText = "";
      form.style.display = "none";
      backButton.style.display = "block";
      simulation.style.display = "block";

      createSimulation(floorCount, liftCount);
    }
  });
});
