/* ==========================================================================
   ChefFlow AI — Application Logic & Constraint Engine
   ========================================================================== */

// No longer using hardcoded RECIPES_DB. OpenAI will generate recipes dynamically.

// Global State
let userPantry = [];
let currentGeneratedPlan = null;

// DOM Elements
const landingScreen = document.getElementById("landing-screen");
const formScreen = document.getElementById("form-screen");
const loaderScreen = document.getElementById("loader-screen");
const resultsScreen = document.getElementById("results-screen");

// Navigation buttons
const startPlanningCta = document.getElementById("start-planning-cta");
const navStartBtn = document.getElementById("nav-start-btn");
const logoLink = document.getElementById("logo-link");
const submitPlanBtn = document.getElementById("submit-plan-btn");
const btnRestartPlanning = document.getElementById("btn-restart-planning");

// Form variables
const preferencesForm = document.getElementById("preferences-form");
const inputBudget = document.getElementById("input-budget");
const inputPeople = document.getElementById("input-people");
const inputBaseUrl = document.getElementById("input-base-url");
const inputApiKey = document.getElementById("input-api-key");
const selectModel = document.getElementById("select-model");
const btnFetchModels = document.getElementById("btn-fetch-models");
const customModelGroup = document.getElementById("custom-model-group");
const inputModelCustom = document.getElementById("input-model-custom");
const modelFetchStatus = document.getElementById("model-fetch-status");
const ingredientInput = document.getElementById("ingredient-input");

// Load stored values from localStorage
const storedBaseUrl = localStorage.getItem("chefflow_openai_base_url");
const storedApiKey = localStorage.getItem("chefflow_openai_api_key");
const storedModel = localStorage.getItem("chefflow_openai_model");

if (storedBaseUrl) {
  inputBaseUrl.value = storedBaseUrl;
}
if (storedApiKey) {
  inputApiKey.value = storedApiKey;
}

// Keep track of loaded models
let availableModelsList = [];

// Handle custom option toggle
selectModel.addEventListener("change", () => {
  if (selectModel.value === "custom") {
    customModelGroup.style.display = "block";
    inputModelCustom.required = true;
    inputModelCustom.focus();
  } else {
    customModelGroup.style.display = "none";
    inputModelCustom.required = false;
  }
});

// Setup dynamic loaded model selection if stored
if (storedModel) {
  const defaultOptions = Array.from(selectModel.options).map(opt => opt.value);
  if (defaultOptions.includes(storedModel)) {
    selectModel.value = storedModel;
  } else {
    // If not one of the default options, we inject it temporarily as a fetched option
    const newOption = document.createElement("option");
    newOption.value = storedModel;
    newOption.textContent = `${storedModel} (Saved)`;
    selectModel.insertBefore(newOption, selectModel.options[selectModel.options.length - 1]);
    selectModel.value = storedModel;
  }
}

// Function to fetch models
async function fetchModels() {
  const baseUrl = inputBaseUrl.value.trim();
  const apiKey = inputApiKey.value.trim();

  if (!baseUrl) {
    showModelStatus("Please enter a valid Base URL first.", "warning");
    return;
  }

  showModelStatus("Fetching available models...", "loading");
  btnFetchModels.disabled = true;
  const originalText = btnFetchModels.textContent;
  btnFetchModels.textContent = "Loading...";

  try {
    const cleanUrl = baseUrl.replace(/\/$/, "");
    const headers = {
      "Accept": "application/json"
    };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(`${cleanUrl}/models`, {
      method: "GET",
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to retrieve models`);
    }

    const data = await response.json();
    if (data && Array.isArray(data.data)) {
      // Clear previous options but save custom option
      const currentSelected = selectModel.value;
      selectModel.innerHTML = "";

      availableModelsList = data.data
        .map(m => m.id)
        .filter(id => typeof id === "string")
        .sort((a, b) => a.localeCompare(b));

      if (availableModelsList.length === 0) {
        throw new Error("No model IDs found in response.");
      }

      availableModelsList.forEach(modelId => {
        const option = document.createElement("option");
        option.value = modelId;
        option.textContent = modelId;
        selectModel.appendChild(option);
      });

      // Add custom option
      const customOption = document.createElement("option");
      customOption.value = "custom";
      customOption.textContent = "Enter Custom Model...";
      selectModel.appendChild(customOption);

      // Restore selection if matching
      if (availableModelsList.includes(currentSelected)) {
        selectModel.value = currentSelected;
      } else if (currentSelected === "custom" || currentSelected === storedModel) {
        // If it's custom or was the saved one, we add the option or keep custom
        if (currentSelected === storedModel && !availableModelsList.includes(storedModel)) {
          const opt = document.createElement("option");
          opt.value = storedModel;
          opt.textContent = `${storedModel} (Saved)`;
          selectModel.insertBefore(opt, customOption);
          selectModel.value = storedModel;
        } else {
          selectModel.value = currentSelected;
        }
      } else {
        // Look for gpt-4o-mini as a default fallback inside list
        const mini = availableModelsList.find(m => m.includes("gpt-4o-mini") || m.includes("gpt-4-mini"));
        if (mini) {
          selectModel.value = mini;
        } else {
          selectModel.value = availableModelsList[0];
        }
      }

      showModelStatus(`Successfully loaded ${availableModelsList.length} models!`, "success");
    } else {
      throw new Error("Unexpected response structure (missing data array).");
    }
  } catch (error) {
    console.error("Fetch models error:", error);
    showModelStatus("Could not fetch models (CORS restriction or invalid API key). Entering manual fallback.", "warning");
    
    // Auto toggle to custom input
    selectModel.value = "custom";
    customModelGroup.style.display = "block";
    inputModelCustom.required = true;
  } finally {
    btnFetchModels.disabled = false;
    btnFetchModels.textContent = originalText;
  }
}

function showModelStatus(msg, type) {
  modelFetchStatus.textContent = msg;
  modelFetchStatus.className = "help-text";
  if (type === "warning") {
    modelFetchStatus.style.color = "#ff6b6b";
  } else if (type === "success") {
    modelFetchStatus.style.color = "#4ade80";
  } else if (type === "loading") {
    modelFetchStatus.style.color = "var(--color-text-secondary)";
  } else {
    modelFetchStatus.style.color = "";
  }
}

// Bind button listener
btnFetchModels.addEventListener("click", fetchModels);
const tagsWrapper = document.getElementById("tags-wrapper");
const suggestionsList = document.getElementById("suggestions-list");
const progressBarFill = document.getElementById("progress-bar-fill");
const pantryAnnouncer = document.getElementById("pantry-announcer");

// Terminal logs
const terminalLogs = document.getElementById("terminal-logs");

// Results display fields
const dashboardSubtitleMeta = document.getElementById("dashboard-subtitle-meta");
const dashboardEstimatedCost = document.getElementById("dashboard-estimated-cost");
const dashboardBudgetLimit = document.getElementById("dashboard-budget-limit");
const budgetBarFill = document.getElementById("budget-bar-fill");
const budgetCard = document.getElementById("budget-card");
const budgetBadgeStatus = document.getElementById("budget-badge-status");
const budgetStatusMessage = document.getElementById("budget-status-message");

const breakfastName = document.getElementById("breakfast-name");
const breakfastTime = document.getElementById("breakfast-time");
const breakfastIngredients = document.getElementById("breakfast-ingredients");

const lunchName = document.getElementById("lunch-name");
const lunchTime = document.getElementById("lunch-time");
const lunchIngredients = document.getElementById("lunch-ingredients");

const dinnerName = document.getElementById("dinner-name");
const dinnerTime = document.getElementById("dinner-time");
const dinnerIngredients = document.getElementById("dinner-ingredients");

const groceryShoppingList = document.getElementById("grocery-shopping-list");
const substitutionsListContainer = document.getElementById("substitutions-list-container");

// Export Actions
const btnCopyPlan = document.getElementById("btn-copy-plan");
const btnDownloadPlan = document.getElementById("btn-download-plan");

/* ==========================================================================
   Navigation & View Swapping
   ========================================================================== */

function showScreen(screenToShow) {
  [landingScreen, formScreen, loaderScreen, resultsScreen].forEach(s => s.classList.remove("active"));
  screenToShow.classList.add("active");
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// CTA & Logo Routing
startPlanningCta.addEventListener("click", () => showScreen(formScreen));
navStartBtn.addEventListener("click", () => showScreen(formScreen));
logoLink.addEventListener("click", (e) => {
  e.preventDefault();
  showScreen(landingScreen);
});
btnRestartPlanning.addEventListener("click", () => {
  preferencesForm.reset();
  userPantry = [];
  renderPantryTags();
  updateStepIndicator(1);
  showScreen(formScreen);
});

/* ==========================================================================
   Form Wizard Logic
   ========================================================================== */

function updateStepIndicator(step) {
  // Show only matching step container
  document.querySelectorAll(".form-step-section").forEach(sec => {
    sec.classList.remove("active");
    if (parseInt(sec.getAttribute("data-step")) === step) {
      sec.classList.add("active");
    }
  });

  // Scale progress bar (3 steps)
  const percent = ((step - 1) / 2) * 100;
  progressBarFill.style.width = `${percent}%`;

  // Update progress bar accessibility attributes
  const stepsProgress = document.querySelector(".steps-progress");
  if (stepsProgress) {
    stepsProgress.setAttribute("aria-valuenow", step);
  }
}

// Wizard Button Listeners
document.querySelectorAll(".btn-next").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const nextStep = parseInt(e.target.getAttribute("data-next"));
    const currentStep = nextStep - 1;

    // Validate current step fields
    if (validateStep(currentStep)) {
      updateStepIndicator(nextStep);
    }
  });
});

document.querySelectorAll(".btn-prev").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const prevStep = parseInt(e.target.getAttribute("data-prev"));
    updateStepIndicator(prevStep);
  });
});

function validateStep(step) {
  let isValid = true;

  if (step === 1) {
    // Validate Budget
    const budgetVal = parseFloat(inputBudget.value);
    const budgetGroup = inputBudget.closest(".form-group");
    if (isNaN(budgetVal) || budgetVal < 10 || budgetVal > 10000) {
      budgetGroup.classList.add("has-error");
      inputBudget.setAttribute("aria-invalid", "true");
      isValid = false;
    } else {
      budgetGroup.classList.remove("has-error");
      inputBudget.setAttribute("aria-invalid", "false");
    }

    // Validate People Count
    const peopleVal = parseInt(inputPeople.value);
    const peopleGroup = inputPeople.closest(".form-group");
    if (isNaN(peopleVal) || peopleVal < 1 || peopleVal > 20) {
      peopleGroup.classList.add("has-error");
      inputPeople.setAttribute("aria-invalid", "true");
      isValid = false;
    } else {
      peopleGroup.classList.remove("has-error");
      inputPeople.setAttribute("aria-invalid", "false");
    }

    // Validate Base URL
    const baseUrlVal = inputBaseUrl.value.trim();
    const baseUrlGroup = inputBaseUrl.closest(".form-group");
    if (!baseUrlVal || !baseUrlVal.startsWith("http")) {
      baseUrlGroup.classList.add("has-error");
      inputBaseUrl.setAttribute("aria-invalid", "true");
      isValid = false;
    } else {
      baseUrlGroup.classList.remove("has-error");
      inputBaseUrl.setAttribute("aria-invalid", "false");
    }

    // Validate API Key
    const apiKeyVal = inputApiKey.value.trim();
    const apiGroup = inputApiKey.closest(".form-group");
    const isLocalhost = baseUrlVal.includes("localhost") || baseUrlVal.includes("127.0.0.1");
    if (!isLocalhost && !apiKeyVal) {
      apiGroup.classList.add("has-error");
      inputApiKey.setAttribute("aria-invalid", "true");
      isValid = false;
    } else {
      apiGroup.classList.remove("has-error");
      inputApiKey.setAttribute("aria-invalid", "false");
    }

    // Validate Custom Model
    if (selectModel.value === "custom") {
      const customModelVal = inputModelCustom.value.trim();
      const customErrorMsg = document.getElementById("error-model-custom");
      if (!customModelVal) {
        customModelGroup.classList.add("has-error");
        inputModelCustom.setAttribute("aria-invalid", "true");
        isValid = false;
      } else {
        customModelGroup.classList.remove("has-error");
        inputModelCustom.setAttribute("aria-invalid", "false");
      }
    }
  }

  return isValid;
}

/* ==========================================================================
   Pantry Tags Input System
   ========================================================================== */

function addPantryIngredient(ingredientName) {
  const cleaned = ingredientName.trim();
  if (!cleaned) return;

  // Prevent duplicates
  const lowercase = cleaned.toLowerCase();
  const exists = userPantry.some(item => item.toLowerCase() === lowercase);

  if (!exists) {
    userPantry.push(cleaned);
    renderPantryTags();
    if (pantryAnnouncer) pantryAnnouncer.textContent = `${cleaned} added to pantry.`;
  }
  ingredientInput.value = "";
}

function removePantryIngredient(index) {
  const removed = userPantry[index];
  userPantry.splice(index, 1);
  renderPantryTags();
  if (pantryAnnouncer) pantryAnnouncer.textContent = `${removed} removed from pantry.`;
}

function renderPantryTags() {
  tagsWrapper.innerHTML = "";
  userPantry.forEach((item, index) => {
    const tagSpan = document.createElement("span");
    tagSpan.className = "tag";
    
    // Safely append text node
    tagSpan.appendChild(document.createTextNode(item + " "));
    
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-remove-tag";
    btn.setAttribute("data-idx", index);
    btn.setAttribute("aria-label", `Remove ${item}`);
    btn.innerHTML = "&times;";
    
    tagSpan.appendChild(btn);
    tagsWrapper.appendChild(tagSpan);
  });
}

// Event Listeners for Tags UI
tagsWrapper.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-remove-tag")) {
    const idx = parseInt(e.target.getAttribute("data-idx"));
    removePantryIngredient(idx);
  }
});

ingredientInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === ",") {
    e.preventDefault();
    addPantryIngredient(ingredientInput.value);
  }
});

// Add suggestion tag click handler
suggestionsList.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-tag-suggestion")) {
    const val = e.target.getAttribute("data-val");
    addPantryIngredient(val);
  }
});

/* ==========================================================================
   AI Constraints Matching Planner Engine
   ========================================================================== */

function isIngredientInPantry(ing, pantryList) {
  const clean = (str) => str.toLowerCase().replace(/[(),.-]/g, ' ').replace(/\s+/g, ' ').trim();
  const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  const cr = clean(ing);
  return pantryList.some(p => {
    const cp = clean(p);
    if (cr === cp) return true;
    
    // Check for word boundary match
    try {
      const regexP = new RegExp('\\b' + escapeRegExp(cp) + '\\b');
      const regexR = new RegExp('\\b' + escapeRegExp(cr) + '\\b');
      return regexP.test(cr) || regexR.test(cp);
    } catch (e) {
      return cr.includes(cp) || cp.includes(cr);
    }
  });
}

async function generateMealPlan(budget, people, diet, maxTime, pantry, baseUrl, apiKey, model) {
  const schema = {
    "type": "object",
    "properties": {
      "breakfast": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "time": { "type": "number", "description": "Time in minutes" },
          "ingredients": { "type": "array", "items": { "type": "string" } }
        },
        "required": ["name", "time", "ingredients"],
        "additionalProperties": false
      },
      "lunch": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "time": { "type": "number", "description": "Time in minutes" },
          "ingredients": { "type": "array", "items": { "type": "string" } }
        },
        "required": ["name", "time", "ingredients"],
        "additionalProperties": false
      },
      "dinner": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "time": { "type": "number", "description": "Time in minutes" },
          "ingredients": { "type": "array", "items": { "type": "string" } }
        },
        "required": ["name", "time", "ingredients"],
        "additionalProperties": false
      },
      "groceryList": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Ingredients from all meals that are NOT in the pantry. If all ingredients are in the pantry, this should be empty."
      },
      "substitutions": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "original": { "type": "string" },
            "replacement": { "type": "string" }
          },
          "required": ["original", "replacement"],
          "additionalProperties": false
        },
        "description": "Suggestions to substitute hard-to-find ingredients from the groceryList."
      },
      "estimatedCost": {
        "type": "number",
        "description": "Estimated cost in INR (₹) of only the items in the groceryList. Pantry items cost 0."
      },
      "budgetStatus": {
        "type": "string",
        "enum": ["within_budget", "exceeds_budget"],
        "description": "Is the estimatedCost less than or equal to the daily budget?"
      }
    },
    "required": ["breakfast", "lunch", "dinner", "groceryList", "substitutions", "estimatedCost", "budgetStatus"],
    "additionalProperties": false
  };

  const prompt = `You are a professional chef and budget meal planner. 
Generate a 1-day meal plan for ${people} people.
Dietary Preference: ${diet}
Max Prep Time per meal: ${maxTime} mins
Daily Budget for groceries: ₹${budget}
Ingredients available at home (Pantry): ${pantry.length > 0 ? pantry.join(", ") : "None"}

Rules:
1. Breakfast, lunch, and dinner must match the dietary preference and max prep time.
2. The groceryList must ONLY include ingredients needed for the meals that are NOT already in the pantry.
3. Calculate the estimated grocery cost (in INR) realistically based only on the items in the groceryList (items in the pantry are free).
4. Do not include markdown or extra text. Output strict JSON matching the provided schema.`;

  const cleanUrl = baseUrl.replace(/\/$/, "");
  const headers = {
    "Content-Type": "application/json"
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  let response;
  let useFallbackFormat = false;

  try {
    // Attempt 1: Strict JSON Schema (works on OpenAI)
    response = await fetch(`${cleanUrl}/chat/completions`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        response_format: { 
          type: "json_schema", 
          json_schema: {
            name: "meal_plan_response",
            schema: schema,
            strict: true
          }
        },
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errMsg = errorData.error?.message || "";
      if (response.status === 400 || errMsg.toLowerCase().includes("schema") || errMsg.toLowerCase().includes("response_format")) {
        useFallbackFormat = true;
      } else {
        throw new Error(errMsg || `HTTP ${response.status}`);
      }
    }
  } catch (error) {
    console.warn("Structured JSON schema output failed or unsupported, trying fallback format...", error);
    useFallbackFormat = true;
  }

  if (useFallbackFormat) {
    try {
      // Attempt 2: Basic JSON Object (supported by DeepSeek, Ollama, Together AI, OpenRouter, etc.)
      response = await fetch(`${cleanUrl}/chat/completions`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "user", content: prompt + "\n\nCRITICAL: You MUST respond with a raw JSON object that conforms EXACTLY to the specified schema structure. Do not wrap in markdown block formatting." }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP Fallback ${response.status}`);
      }
    } catch (fallbackError) {
      console.error("Fallback generation also failed:", fallbackError);
      throw fallbackError;
    }
  }

  try {
    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Clean any markdown formatting if returned (sometimes models include it even when requested not to)
    if (content.startsWith("```json")) {
      content = content.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (content.startsWith("```")) {
      content = content.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    return JSON.parse(content);
  } catch (parseError) {
    console.error("Failed to parse meal plan JSON response:", parseError);
    // Return fallback layout so page doesn't break
    return {
      breakfast: { name: "Error Loading Plan", time: 0, ingredients: [] },
      lunch: { name: "Error Loading Plan", time: 0, ingredients: [] },
      dinner: { name: "Error Loading Plan", time: 0, ingredients: [] },
      groceryList: [],
      substitutions: [],
      estimatedCost: 0,
      budgetStatus: "within_budget"
    };
  }
}

/* ==========================================================================
   Loading Simulation & Rendering
   ========================================================================== */

function addLogLine(text, delay, type = "") {
  return new Promise(resolve => {
    setTimeout(() => {
      const line = document.createElement("p");
      line.className = `log-line ${type}`;
      line.textContent = text;
      terminalLogs.appendChild(line);
      terminalLogs.scrollTop = terminalLogs.scrollHeight;
      resolve();
    }, delay);
  });
}

async function runLoadingSequence(budget, people, diet, time, pantry, baseUrl, apiKey, model) {
  terminalLogs.innerHTML = "";
  showScreen(loaderScreen);

  await addLogLine("> Establishing connection to API endpoint...", 100);
  await addLogLine(`> Target Model: ${model}`, 100);
  await addLogLine(`> Sending constraints (Budget: ₹${budget}, Diet: ${diet}, People: ${people})...`, 250);
  await addLogLine(`> Cross-referencing ${pantry.length} pantry items from home storage...`, 200);
  await addLogLine("> Generating dynamic meal plan using AI model...", 250);
  
  // Calculate result mid-sequence via API
  const resultPlan = await generateMealPlan(budget, people, diet, time, pantry, baseUrl, apiKey, model);

  if (resultPlan.estimatedCost === 0 && resultPlan.groceryList.length === 0 && resultPlan.breakfast.name === "Error Loading Plan") {
    await addLogLine("> Error: Failed to fetch plan from API. Check your API credentials, Base URL, or network.", 100, "warning");
    setTimeout(() => {
      showScreen(formScreen);
    }, 3000);
    return;
  }

  await addLogLine(`> Estimated plan grocery cost: ₹${resultPlan.estimatedCost} (${resultPlan.budgetStatus.replace('_', ' ')})...`, 200, "highlight");
  await addLogLine("> Resolving dynamic ingredient substitutions...", 150);
  await addLogLine("> Compiling unified shopping checklist...", 150);
  await addLogLine("> Planning completed successfully! Launching dashboard...", 200, "success");

  setTimeout(() => {
    renderResults(resultPlan, budget, people, diet, time);
    showScreen(resultsScreen);
    if (typeof observeCards === 'function') observeCards();
  }, 300);
}

function renderResults(plan, budget, people, diet, time) {
  currentGeneratedPlan = plan;

  // Metadata Headline
  dashboardSubtitleMeta.textContent = `${people} ${people === 1 ? 'Person' : 'People'} • ${diet.charAt(0).toUpperCase() + diet.slice(1)} • Max Prep: ${time} mins`;

  // Cost status cards
  dashboardEstimatedCost.textContent = `₹${plan.estimatedCost}`;
  dashboardBudgetLimit.textContent = `₹${budget}`;

  const costPercentage = Math.min((plan.estimatedCost / budget) * 100, 100);
  budgetBarFill.style.width = `${costPercentage}%`;

  if (plan.budgetStatus === "within_budget") {
    budgetBadgeStatus.textContent = "WITHIN BUDGET";
    budgetBadgeStatus.className = "budget-badge success";
    budgetBarFill.className = "comparison-bar-fill";
    budgetStatusMessage.textContent = `Awesome! Estimated cost ₹${plan.estimatedCost} is well within your ₹${budget} daily budget constraint.`;
  } else {
    budgetBadgeStatus.textContent = "EXCEEDS BUDGET";
    budgetBadgeStatus.className = "budget-badge warning";
    budgetBarFill.className = "comparison-bar-fill warning";
    budgetStatusMessage.textContent = `Warning: Estimated grocery cost of ₹${plan.estimatedCost} exceeds your ₹${budget} budget limit. Add more pantry ingredients to save more!`;
  }

  // Position the limit marker
  const limitMarker = document.getElementById("budget-limit-marker");
  limitMarker.style.left = `100%`;

  // Fill Recipes
  const fillRecipeCard = (ingredientsUl, ingredientsList) => {
    ingredientsUl.innerHTML = "";
    ingredientsList.forEach(ing => {
      const li = document.createElement("li");
      const isOwned = isIngredientInPantry(ing, userPantry);
      li.textContent = ing + (isOwned ? " (In Pantry)" : "");
      if (isOwned) {
        li.style.opacity = "0.6";
        li.style.textDecoration = "line-through";
      }
      ingredientsUl.appendChild(li);
    });
  };

  breakfastName.textContent = plan.breakfast.name;
  breakfastTime.textContent = `${plan.breakfast.time} mins`;
  fillRecipeCard(breakfastIngredients, plan.breakfast.ingredients);

  lunchName.textContent = plan.lunch.name;
  lunchTime.textContent = `${plan.lunch.time} mins`;
  fillRecipeCard(lunchIngredients, plan.lunch.ingredients);

  dinnerName.textContent = plan.dinner.name;
  dinnerTime.textContent = `${plan.dinner.time} mins`;
  fillRecipeCard(dinnerIngredients, plan.dinner.ingredients);

  // Fill Grocery List
  groceryShoppingList.innerHTML = "";
  if (plan.groceryList.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.textContent = "No groceries needed! You have all ingredients in your pantry.";
    emptyMsg.style.fontStyle = "italic";
    groceryShoppingList.appendChild(emptyMsg);
  } else {
    plan.groceryList.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "shopping-item";
      
      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = `grocery-item-${index}`;
      
      const label = document.createElement("label");
      label.setAttribute("for", `grocery-item-${index}`);
      
      const span = document.createElement("span");
      span.textContent = item;
      
      label.appendChild(span);
      li.appendChild(input);
      li.appendChild(label);
      groceryShoppingList.appendChild(li);

      // Handle checkbox toggle class
      input.addEventListener("change", () => {
        if (input.checked) {
          li.classList.add("checked");
        } else {
          li.classList.remove("checked");
        }
      });
    });
  }

  // Fill Substitutions
  substitutionsListContainer.innerHTML = "";
  if (plan.substitutions.length === 0) {
    const emptySub = document.createElement("p");
    emptySub.textContent = "No substitutions needed for this plan.";
    emptySub.style.fontStyle = "italic";
    substitutionsListContainer.appendChild(emptySub);
  } else {
    plan.substitutions.forEach(sub => {
      const row = document.createElement("div");
      row.className = "substitution-card";
      
      const spanOriginal = document.createElement("span");
      spanOriginal.className = "sub-original";
      spanOriginal.textContent = sub.original;
      
      const spanArrow = document.createElement("span");
      spanArrow.className = "sub-arrow";
      spanArrow.innerHTML = "&rarr;";
      
      const spanReplacement = document.createElement("span");
      spanReplacement.className = "sub-replacement";
      spanReplacement.textContent = sub.replacement;
      
      row.appendChild(spanOriginal);
      row.appendChild(spanArrow);
      row.appendChild(spanReplacement);
      substitutionsListContainer.appendChild(row);
    });
  }
}

/* ==========================================================================
   Submit Handler
   ========================================================================== */

preferencesForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validateStep(1)) {
    updateStepIndicator(1);
    return;
  }

  // Fetch constraints
  const budget = parseFloat(inputBudget.value);
  const people = parseInt(inputPeople.value);
  const baseUrl = inputBaseUrl.value.trim();
  const apiKey = inputApiKey.value.trim();
  const model = selectModel.value === "custom" ? inputModelCustom.value.trim() : selectModel.value;
  const diet = document.querySelector('input[name="diet"]:checked').value;
  const time = parseInt(document.querySelector('input[name="cooking-time"]:checked').value);

  // Save credentials and selected model in localStorage
  localStorage.setItem("chefflow_openai_base_url", baseUrl);
  localStorage.setItem("chefflow_openai_api_key", apiKey);
  localStorage.setItem("chefflow_openai_model", model);

  runLoadingSequence(budget, people, diet, time, userPantry, baseUrl, apiKey, model);
});

/* ==========================================================================
   Export Functionality
   ========================================================================== */

function getPlanFormattedText() {
  if (!currentGeneratedPlan) return "";

  const plan = currentGeneratedPlan;
  return `=== CHEFFLOW AI MEAL PLAN ===
Estimated Cost: ₹${plan.estimatedCost} (${plan.budgetStatus.replace('_', ' ').toUpperCase()})

BREAKFAST: ${plan.breakfast.name} (${plan.breakfast.time} mins)
Ingredients: ${plan.breakfast.ingredients.join(', ')}

LUNCH: ${plan.lunch.name} (${plan.lunch.time} mins)
Ingredients: ${plan.lunch.ingredients.join(', ')}

DINNER: ${plan.dinner.name} (${plan.dinner.time} mins)
Ingredients: ${plan.dinner.ingredients.join(', ')}

SHOPPING LIST:
${plan.groceryList.map(item => `[ ] ${item}`).join('\n')}

SUBSTITUTIONS:
${plan.substitutions.map(sub => `- ${sub.original} -> ${sub.replacement}`).join('\n')}
`;
}

btnCopyPlan.addEventListener("click", () => {
  const txt = getPlanFormattedText();
  navigator.clipboard.writeText(txt).then(() => {
    const originalText = btnCopyPlan.textContent;
    btnCopyPlan.textContent = "Copied!";
    setTimeout(() => {
      btnCopyPlan.textContent = originalText;
    }, 1500);
  }).catch(err => {
    alert("Could not copy to clipboard. Please try again.");
  });
});

btnDownloadPlan.addEventListener("click", () => {
  const txt = getPlanFormattedText();
  const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `chefflow-meal-plan-${new Date().toISOString().slice(0, 10)}.txt`;
  link.click();
  URL.revokeObjectURL(url);
});

/* ==========================================================================
   Animations & Intersection Observers
   ========================================================================== */

const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = `floatUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards`;
      obs.unobserve(entry.target);
    }
  });
}, observerOptions);

function observeCards() {
  const cards = document.querySelectorAll('#results-screen .feature-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.animation = 'none';
    // Staggered entrance
    setTimeout(() => {
      observer.observe(card);
    }, index * 100);
  });
}

