let cols, rows;
let grid;
let resolution = 20; // Adjust as needed for cell size
let running = false; // Controls the running state
let birth = 3; // Number of neighbors for a dead cell to become alive
let survivalMin = 2; // Minimum neighbors for an alive cell to stay alive
let survivalMax = 3; // Maximum neighbors for an alive cell to stay alive
let speedSlider;

function setup() {
    createCanvas(1200, 600);
    //background('#333');
    cols = width / resolution;
    rows = height / resolution;
  
    grid = make2DArray(cols, rows);
    initializeGrid();
  
    // Adjusted UI elements for a more bubbly and friendly look
    let uiYOffset = height + 30; // Y Offset for all UI components
    let buttonSpacing = 120; // Horizontal spacing between buttons and selects
  
    let startButton = createButton('Start');
    startButton.position(10, uiYOffset);
    startButton.mousePressed(startSimulation);
    styleButton(startButton);
  
    let stopButton = createButton('Stop');
    stopButton.position(10 + buttonSpacing, uiYOffset);
    stopButton.mousePressed(pauseSimulation);
    styleButton(stopButton);
  
    let restartButton = createButton('Restart');
    restartButton.position(10 + buttonSpacing * 2, uiYOffset);
    restartButton.mousePressed(restartSimulation);
    styleButton(restartButton);
  
    // Slider for speed control
    speedSlider = createSlider(1, 60, 30); // Default speed is 30 FPS
    speedSlider.position(10, uiYOffset + 40);
    speedSlider.style('width', '180px');
  
    // Clear Board Button
    let clearButton = createButton('Clear Board');
    clearButton.position(10 + buttonSpacing * 3, uiYOffset);
    clearButton.mousePressed(clearBoard);
    styleButton(clearButton);

    // Step Button
    let stepButton = createButton('Step');
    stepButton.position(10 + buttonSpacing * 4, uiYOffset);
    stepButton.mousePressed(stepSimulation);
    styleButton(stepButton);

    // Adjust positioning for the rule selects to avoid overlap
    createDiv('Birth:').position(10 + buttonSpacing * 5, uiYOffset - 20);
    birthSelect = createSelect();
    birthSelect.position(10 + buttonSpacing * 5, uiYOffset);
    populateSelect(birthSelect, birth);

    createDiv('Survival Min:').position(10 + buttonSpacing * 6, uiYOffset - 20);
    survivalMinSelect = createSelect();
    survivalMinSelect.position(10 + buttonSpacing * 6, uiYOffset);
    populateSelect(survivalMinSelect, survivalMin);

    createDiv('Survival Max:').position(10 + buttonSpacing * 7, uiYOffset - 20);
    survivalMaxSelect = createSelect();
    survivalMaxSelect.position(10 + buttonSpacing * 7, uiYOffset);
    populateSelect(survivalMaxSelect, survivalMax);
}
  
function styleButton(btn) {
    btn.style('background-color', '#FFC0CB'); // A soft pink
    btn.style('border', 'none');
    btn.style('border-radius', '12px'); // Rounded corners for a bubbly look
    btn.style('color', 'black');
    btn.style('padding', '10px 24px');
}
  
function populateSelect(select, selectedValue) {
    for (let i = 1; i <= 8; i++) {
      select.option(i);
    }
    select.selected(selectedValue);
    select.changed(() => {
      const val = parseInt(select.value());
      switch (select) {
        case birthSelect:
          birth = val;
          break;
        case survivalMinSelect:
          survivalMin = val;
          break;
        case survivalMaxSelect:
          survivalMax = val;
          break;
      }
    });
}

function initializeGrid() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = floor(random(2));
    }
  }
}

function startSimulation() {
  running = true;
}

function pauseSimulation() {
  running = false;
}

function restartSimulation() {
  initializeGrid(); // Reinitialize the grid with a new seed
  running = true; // Automatically start the simulation
}

function draw() {
    background(220); // Light background for a friendly appearance
  
    if (running) {
      // Adjust the frame rate based on the slider value
      frameRate(speedSlider.value());
    }
  
    // Display the current state of each cell
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let x = i * resolution;
        let y = j * resolution;
        if (grid[i][j] == 1) {
          fill('#ffcccb'); // Cute pink for alive cells
          stroke('#000000'); // Light blue stroke for a soft look
        } else {
          fill('#475561'); // Very light blue for dead cells
          stroke('#add8e6'); // Consistent stroke color
        }
        rect(x, y, resolution, resolution);
      }
    }
  
    // Update the grid if the simulation is running
    if (running) {
      let next = make2DArray(cols, rows);
  
      // Compute next based on grid using the updated rules
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          let state = grid[i][j];
          let neighbors = countNeighbors(grid, i, j);
  
          // Applying variable rules for birth and survival
          if (state == 0 && neighbors == birth) {
            next[i][j] = 1; // Birth condition
          } else if (state == 1 && (neighbors >= survivalMin && neighbors <= survivalMax)) {
            next[i][j] = state; // Survival condition
          } else {
            next[i][j] = 0; // Death condition
          }
        }
      }
  
      grid = next;
    }
}  

function countNeighbors(grid, x, y) {
  let sum = 0;
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      let col = (x + i + cols) % cols;
      let row = (y + j + rows) % rows;

      sum += grid[col][row];
    }
  }
  sum -= grid[x][y];
  return sum;
}

function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

function mousePressed() {
    if (!running) { // Only allow cell state change if the animation is paused
      let col = floor(mouseX / resolution);
      let row = floor(mouseY / resolution);
      if (col >= 0 && col < cols && row >= 0 && row < rows) { // Check if the click is within the grid
        grid[col][row] = grid[col][row] ? 0 : 1; // Toggle the cell state
      }
    }
}
  
function mouseDragged() {
    if (!running) { // Only allow changes if the animation is paused
      let col = floor(mouseX / resolution);
      let row = floor(mouseY / resolution);
      if (col >= 0 && col < cols && row >= 0 && row < rows) { // Check if the drag is within the grid
        if (grid[col][row] === 0) { // Only make the cell alive if it's currently dead
          grid[col][row] = 1;
        }
      }
    }
    return false; // Prevent default behavior
}

function clearBoard() {
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        grid[i][j] = 0;
      }
    }
}
  
function stepSimulation() {
    // This function is similar to the update logic in draw function
    let next = make2DArray(cols, rows);
  
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let state = grid[i][j];
        let neighbors = countNeighbors(grid, i, j);
  
        if (state == 0 && neighbors == birth) {
          next[i][j] = 1;
        } else if (state == 1 && (neighbors >= survivalMin && neighbors <= survivalMax)) {
          next[i][j] = state;
        } else {
          next[i][j] = 0;
        }
      }
    }
    
    grid = next;
}
  