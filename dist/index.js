const liveMatchContainers = document.getElementById('liveMatchContainers')
const COUNTRIES = document.getElementById('countries')

var requestOptions = {
  method: 'GET',
  redirect: 'follow'
};


async function fetchData() {

  const response = await fetch("https://www.legaseriea.it/api/season/157617/championship/A/matchday?lang=en", requestOptions);

  const result = await response.json();

  const matchDayData = await result.data;

  return matchDayData;
  
}

async function populateDropDownMenu(){
    
  fetchData().then(res => {

        res.forEach(element => {
        
        const selectElement = document.createElement('option')

        selectElement.value = element.id_category;
        
        let res = element.title.replace(/Giornata/g, "Match Day");

        selectElement.innerText = res;
        
        COUNTRIES.append(selectElement);
      })
    
      triggerMatchScrollOnLoad(COUNTRIES.value)
    
    })
    

}
  
function triggerMatchScroll(e){

  if (e.target.value) {
    const responses = fetch(`https://www.legaseriea.it/api/stats/live/match?extra_link=&order=oldest&lang=en&season_id=157617&page=1&limit=20&pag=&match_day_id=${e.target.value}`, requestOptions)
    .then(response => response.json())
    .then(data => {
      const matchData = data.data.matches;
      let div = " ";
      liveMatchContainers.innerHTML = div;
      matchData.forEach(match => {
        let matchStatus ="0:00"
        
        if(match.match_day_category_status === "PLAYED"){
           matchStatus =  "Final"
        } else if (match.match_day_category_status === "LIVE"){
          matchStatus = match.minutes_played
        } else{
            const dateArray = match.date_time.split("T");
            let date = dateArray[0]
            let time = dateArray[1]
            matchStatus = date + ' ' + time
        }
          div = `<div class='bg-gray-800 w-29 h-20 rounded p-2' id='match-games'>
                  <div class='flex'>
                      <div class='text-white text-sm font-bold'>
                      ${matchStatus}
                      </div>

                  </div>
                  <div class='flex justify-between '>
                      <div class='text-white'>${match.away_team_name}</div>
                      <div class='text-white'>${match.away_goal}</div>
                  </div>
                      
                  
                  <div class='flex justify-between'>
                      <div class='text-white'>${match.home_team_name}</div>
                      <div class='text-white'>${match.home_goal}</div>
                  </div>
                  </div>`;

      liveMatchContainers.innerHTML += div;
    })
  }).then(res => console.log("Fetch Called 3"))
  }
}

function triggerMatchScrollOnLoad(e){
  if (e) {
    const responses = fetch(`https://www.legaseriea.it/api/stats/live/match?extra_link=&order=oldest&lang=en&season_id=157617&page=1&limit=20&pag=&match_day_id=${e}`)
    .then(response => response.json())
    .then(data => {

      const matchData = data.data.matches;

      let div = " ";
      liveMatchContainers.innerHTML = div;
      matchData.forEach(match => {
        let matchStatus ="0:00"
        
        if(match.match_day_category_status === "PLAYED"){
           matchStatus =  "Final"
        } else if (match.match_day_category_status === "LIVE"){
          matchStatus = match.minutes_played
        } else{
        matchStatus = match.date_time
        }
        div = `<div class='bg-gray-800 w-29 h-20 rounded p-2' id='match-games'>
        <div class='flex'>
            <div class='text-white text-sm font-bold'>
            ${matchStatus}
            </div>

        </div>
        <div class='flex justify-between '>
            <div class='text-white'>${match.away_team_name}</div>
            <div class='text-white pl-2'>${match.away_goal}</div>
        </div>
            
        
        <div class='flex justify-between'>
            <div class='text-white'>${match.home_team_name}</div>
            <div class='text-white'>${match.home_goal}</div>
        </div>
        </div>`;
      liveMatchContainers.innerHTML += div;
    })
  })
  }

}

populateDropDownMenu();

COUNTRIES.addEventListener('change', triggerMatchScroll );


          
