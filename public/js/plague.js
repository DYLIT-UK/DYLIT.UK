const API_BASE = "https://s.ndemiccreations.com/plague"
const API_ENDPOINTS = {
    "SEARCH_OLD": `${API_BASE}/scenarios?from={offset}&ln=en&search={query}`,
    "SEARCH": `/api/psearch/{offset}/{query}`
}
const ITEMS_PER_PAGE = 10

const PAGE_INFO = "Page {page} of {ptotal} ({total} Scenarios Total)"
const PREV_BUTTON = "Previous Page"
const NEXT_BUTTON = "Next Page"

const DESC_CUTOFF = 350

let currentPage = 0

let totalPages = 0
let totalResults = 0

let cards = []

let currentXHR = null

let loadingModal = null

function formatted(string) {
    return string.replaceAll(/[^[ -~]/g, "").trim()
}

function doXHRJSON(url, callback) {
    loadingModal.show()
    if(currentXHR != null) currentXHR.abort()

    let xhr = new XMLHttpRequest()
    currentXHR = xhr

    xhr.addEventListener("load", (e) => {
        loadingModal.hide()
        currentXHR = null
        if (xhr.status == 200) {
            callback(JSON.parse(xhr.responseText))
        }
    })
    
    xhr.open("GET", url)
    xhr.send()
}

function addScenarios(scenarios) {
    var scenariosDiv = document.getElementById("scenarios")

    cards.forEach(card => {
        scenariosDiv.removeChild(card)
    })
    cards = []

    scenarios.forEach(scenario => {
        let col = document.createElement("div")
        col.classList.add("col")
        col.id = scenario.uniqId

        let card = document.createElement("div")
        card.classList.add("card", "h-100")

        let cardHeader = document.createElement("div")
        cardHeader.classList.add("card-header", "text-center")

        let cardBody = document.createElement("div")
        cardBody.classList.add("card-body")

        let icon = document.createElement("img")
        icon.width = 54
        icon.height = 54
        icon.src = scenario.iconUrl

        let title = document.createElement("h5")
        let fmt_t = formatted(scenario.title)
        title.innerText = (fmt_t.length > 0) ? fmt_t : "[no title]"

        let author = document.createElement("span")
        author.classList.add("card-subtitle", "mb-2", "text-body-secondary")
        author.innerText = ` by ${scenario.author}`

        let description = document.createElement("p")
        description.classList.add("card-text")
        let fmt_d = formatted(scenario.description)
        description.innerText = (fmt_d.length > 0) ? fmt_d : "[no description]"

        if(fmt_d.length >= DESC_CUTOFF-3) {
            description.innerText = fmt_d.substring(0, DESC_CUTOFF-3) + "..."

            let container = document.createElement("div")
            let showMore = document.createElement("a")
            let showLess = document.createElement("a")
            showMore.classList.add("card-link")
            showLess.classList.add("card-link")

            showMore.innerText = "Show More"
            showLess.innerText = "Show Less"

            showMore.href = "#"
            showLess.href = "#"

            showMore.addEventListener("click", (e) => { e.preventDefault() })
            showLess.addEventListener("click", (e) => { e.preventDefault() })

            showMore.addEventListener("click", () => {
                description.innerText = fmt_d
                showMore.remove()

                let container = document.createElement("div")
                container.appendChild(showLess)

                description.appendChild(container)
            })

            showLess.addEventListener("click", () => {
                description.innerText = fmt_d.substring(0, DESC_CUTOFF-3) + "..."
                showLess.remove()

                let container = document.createElement("div")
                container.appendChild(showMore)

                description.appendChild(container)
            })

            container.appendChild(showMore)

            description.appendChild(container)
        }

        cardHeader.appendChild(icon)
        cardHeader.appendChild(title)

        cardBody.appendChild(description)
        
        title.appendChild(author)

        card.appendChild(cardHeader)
        card.appendChild(cardBody)

        col.appendChild(card)

        scenariosDiv.appendChild(col)

        cards.push(col)
    })

    let pageInfo = document.getElementById("page-info")
    pageInfo.innerText = PAGE_INFO.replace("{page}", currentPage+1).replace("{ptotal}", totalPages+1).replace("{total}", totalResults)
}

function addButtons() {
    var navButtonsGroup = document.getElementById("nav-buttons")
    navButtonsGroup.innerHTML = ""

    let prevButton = document.createElement("button")
    prevButton.classList.add("btn", "btn-primary")
    // prevButton.id = "prev"
    prevButton.innerText = PREV_BUTTON.replace("{page}", Math.max(currentPage-1, 0))

    if(currentPage == 0) { prevButton.disabled = true } else { prevButton.disabled = false }

    let nextButton = document.createElement("button")
    nextButton.classList.add("btn", "btn-primary")
    // nextButton.id = "next"
    nextButton.innerText = NEXT_BUTTON.replace("{page}", Math.min(currentPage+1, totalPages))

    if(currentPage == totalPages) { nextButton.disabled = true } else { nextButton.disabled = false }

    navButtonsGroup.appendChild(prevButton)
    navButtonsGroup.appendChild(nextButton)

    prevButton.addEventListener("click", () => {
        currentPage = Math.max(currentPage-1, 0)
        pageSearch()
    })

    nextButton.addEventListener("click", () => {
        currentPage = Math.min(currentPage+1, totalPages)
        pageSearch()
    })
}

function pageSearch() {
    let searchbar = document.getElementById("searchbar")
    // if (searchbar.value.length > 0) {
    // not gonna lie, when everything was force-searched at startup, and Next did nothing, I thought it was the buttons having race condition problems,
    // but nope. it was this if statement.
    totalResults = 0
    totalPages = 0

    let url = API_ENDPOINTS.SEARCH.replace("{query}", searchbar.value).replace("{offset}", currentPage * ITEMS_PER_PAGE)
    
    doXHRJSON(url, (data) => {
        totalPages = Math.floor(data.totalResults / ITEMS_PER_PAGE)
        totalResults = data.totalResults
        addScenarios(data.scenarioMetaDataArray)
        addButtons()
    })
    // }
}

function search(force = false) {
    let searchbar = document.getElementById("searchbar")
    if ((force ? true : searchbar.value.length > 0)) {
        currentPage = 0
        totalPages = 0
        totalResults = 0

        let url = API_ENDPOINTS.SEARCH.replace("{query}", searchbar.value).replace("{offset}", 0)
        
        doXHRJSON(url, (data) => {
            totalPages = Math.floor(data.totalResults / ITEMS_PER_PAGE)
            totalResults = data.totalResults
            addScenarios(data.scenarioMetaDataArray)
            addButtons()
        })
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadingModal = new bootstrap.Modal(document.getElementById("loadmodal"), {
        backdrop: 'static',
        keyboard: false
    })
    search(true)
    document.getElementById("searchbar").addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            search()
        }
    })

    // document.addEventListener("click", function(e){
    //     const target = e.target.closest(".btn"); // Or any other selector.
      
    //     if(target) {
    //         switch (target.id) {
    //             case "next":
    //                 currentPage = Math.min(currentPage+1, totalPages)
    //                 pageSearch()
    //                 break;
    //             case "prev":
    //                 currentPage = Math.max(currentPage-1, 0)
    //                 pageSearch()
    //                 break;
    //             default:
    //                 break;
    //         }
    //     }
    // });
})