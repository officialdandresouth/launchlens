export function renderEconomics(container) {
    const state = window.launchLensState;

    if (!state.productSpec) {
        window.location.hash = "#spec";
        return;
    }

    const spec = state.productSpec;
    const defaults = {
        sellPrice: spec.target_price_min || 25,
        unitCost: spec.target_unit_cost_max || 8,
        freight: 1.5,
        fbaFee: 5.0,
        referralPct: 15,
    };

    container.innerHTML = `
        <div class="screen economics-screen">
            <div class="economics-header">
                <button class="btn-back" onclick="window.location.hash='#spec'">
                    &larr; Back
                </button>
                <h1 class="screen-title">Unit Economics</h1>
            </div>

            <div class="economics-layout">
                <!-- Inputs -->
                <div class="economics-inputs card">
                    <h2 class="section-heading">Inputs</h2>
                    <div class="econ-input-row">
                        <label for="econ-sell-price">Selling Price ($)</label>
                        <input type="number" id="econ-sell-price" value="${defaults.sellPrice.toFixed(2)}" step="0.01" min="0">
                    </div>
                    <div class="econ-input-row">
                        <label for="econ-unit-cost">Unit Cost ($)</label>
                        <input type="number" id="econ-unit-cost" value="${defaults.unitCost.toFixed(2)}" step="0.01" min="0">
                    </div>
                    <div class="econ-input-row">
                        <label for="econ-freight">Freight / Unit ($)</label>
                        <input type="number" id="econ-freight" value="${defaults.freight.toFixed(2)}" step="0.01" min="0">
                    </div>
                    <div class="econ-input-row">
                        <label for="econ-fba-fee">FBA Fee / Unit ($)</label>
                        <input type="number" id="econ-fba-fee" value="${defaults.fbaFee.toFixed(2)}" step="0.01" min="0">
                    </div>
                    <div class="econ-input-row">
                        <label for="econ-referral">Referral Fee (%)</label>
                        <input type="number" id="econ-referral" value="${defaults.referralPct}" step="0.5" min="0" max="100">
                    </div>
                </div>

                <!-- Results -->
                <div class="economics-results card">
                    <h2 class="section-heading">Breakdown</h2>
                    <div id="econ-results"></div>
                </div>
            </div>

            <!-- Footer Nav -->
            <div class="economics-footer">
                <button class="btn-secondary" onclick="window.location.hash='#spec'">
                    &larr; Back to Spec
                </button>
                <button class="btn-primary" onclick="window.location.hash='#suppliers'">
                    Find Suppliers &rarr;
                </button>
            </div>
        </div>
    `;

    const ids = ["econ-sell-price", "econ-unit-cost", "econ-freight", "econ-fba-fee", "econ-referral"];
    ids.forEach((id) => {
        document.getElementById(id).addEventListener("input", recalculate);
    });

    recalculate();
}

function recalculate() {
    const state = window.launchLensState;
    const sellPrice = parseFloat(document.getElementById("econ-sell-price").value) || 0;
    const unitCost = parseFloat(document.getElementById("econ-unit-cost").value) || 0;
    const freight = parseFloat(document.getElementById("econ-freight").value) || 0;
    const fbaFee = parseFloat(document.getElementById("econ-fba-fee").value) || 0;
    const referralPct = parseFloat(document.getElementById("econ-referral").value) || 0;

    const landedCost = unitCost + freight;
    const referralFee = sellPrice * (referralPct / 100);
    const totalAmazonFees = fbaFee + referralFee;
    const totalCost = landedCost + totalAmazonFees;
    const profitPerUnit = sellPrice - totalCost;
    const marginPct = sellPrice > 0 ? (profitPerUnit / sellPrice) * 100 : 0;
    const roiPerCycle = landedCost > 0 ? (profitPerUnit / landedCost) * 100 : 0;
    const unitsAffordable = landedCost > 0 ? Math.floor(state.budget / landedCost) : 0;
    const totalProfit = profitPerUnit * unitsAffordable;
    const annualizedROI = roiPerCycle * (365 / 90);

    const positive = profitPerUnit >= 0;
    const valClass = positive ? "econ-positive" : "econ-negative";

    document.getElementById("econ-results").innerHTML = `
        <div class="econ-result-row">
            <span class="econ-result-label">Landed Cost</span>
            <span class="econ-result-value">$${landedCost.toFixed(2)}</span>
        </div>
        <div class="econ-result-row">
            <span class="econ-result-label">Referral Fee</span>
            <span class="econ-result-value">$${referralFee.toFixed(2)}</span>
        </div>
        <div class="econ-result-row">
            <span class="econ-result-label">FBA Fee</span>
            <span class="econ-result-value">$${fbaFee.toFixed(2)}</span>
        </div>
        <div class="econ-result-divider"></div>
        <div class="econ-result-row">
            <span class="econ-result-label">Total Cost</span>
            <span class="econ-result-value">$${totalCost.toFixed(2)}</span>
        </div>
        <div class="econ-result-row econ-result-highlight">
            <span class="econ-result-label">Profit / Unit</span>
            <span class="econ-result-value ${valClass}">$${profitPerUnit.toFixed(2)}</span>
        </div>
        <div class="econ-result-row econ-result-highlight">
            <span class="econ-result-label">Margin</span>
            <span class="econ-result-value ${valClass}">${marginPct.toFixed(1)}%</span>
        </div>
        <div class="econ-result-divider"></div>
        <div class="econ-result-row">
            <span class="econ-result-label">ROI per Cycle (90d)</span>
            <span class="econ-result-value ${valClass}">${roiPerCycle.toFixed(1)}%</span>
        </div>
        <div class="econ-result-row">
            <span class="econ-result-label">Annualized ROI</span>
            <span class="econ-result-value ${valClass}">${annualizedROI.toFixed(1)}%</span>
        </div>
        <div class="econ-result-divider"></div>
        <div class="econ-result-row">
            <span class="econ-result-label">Units w/ $${state.budget.toLocaleString()} Budget</span>
            <span class="econ-result-value">${unitsAffordable.toLocaleString()}</span>
        </div>
        <div class="econ-result-row econ-result-highlight">
            <span class="econ-result-label">Total Profit (1 cycle)</span>
            <span class="econ-result-value ${valClass}">$${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
    `;
}
