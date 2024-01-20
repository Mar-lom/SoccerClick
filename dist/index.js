const liveMatchContainers = document.getElementById('liveMatchContainers')
const COUNTRIES = document.getElementById('countries')

var requestOptions = {
  method: 'GET',
  redirect: 'follow'
};


async function CallApiForMatchDayData() {

  const response = await fetch("https://www.legaseriea.it/api/season/157617/championship/A/matchday?lang=en", requestOptions);

  const result = await response.json();

  const matchDayData = await result.data;

  return matchDayData;
  
}


async function populateDropDownMenu() {

  CallApiForMatchDayData().then(res => {

    res.forEach(element => {

      const selectElement = document.createElement('option')

      selectElement.value = element.id_category;

      let res = element.title.replace(/Giornata/g, "Match Day");

      selectElement.innerText = res;
      
      //element.selected = SetSortToCurrentMatchWeek()

      COUNTRIES.append(selectElement);
    })
  
    LoadGameSelectMenu(COUNTRIES.value)

  })
}



function LoadGameSelectMenu(e){
  
  fetch(`https://www.legaseriea.it/api/stats/live/match?extra_link=&order=oldest&lang=en&season_id=157617&page=1&limit=20&pag=&match_day_id=${e}`, requestOptions)
  
  .then(res => res.json())
  
  .then(data => { 

    BuildAGameBlocks(data)

  })}
 

function SetSortToCurrentMatchWeek(e){

  if(e === "LIVE") {

    return true;
  } 
  else if (e === "TO BE PLAYED") 
  {
    return true;
  } 
  
  
}


  function LoadGameNewSelectedGameWeek(e){
  
    fetch(`https://www.legaseriea.it/api/stats/live/match?extra_link=&order=oldest&lang=en&season_id=157617&page=1&limit=20&pag=&match_day_id=${e.target.value}`, requestOptions)
    
    .then(res => res.json())
    
    .then(data => { 
  
      BuildAGameBlocks(data)
  
    })}


function triggerMatchStatus(match){

  let gameStatus = match.match_day_category_status

  let matchStatus ="0:00"

  if (gameStatus === "PLAYED"){

      matchStatus =  "Final"

  } else if (gameStatus === "LIVE"){
   
       matchStatus = match.minutes_played

  } else {

     const dateArray = match.date_time.split("T");

     let date = dateArray[0]

     let time = dateArray[1]

     matchStatus = date + ' ' + time

     
 }

 return matchStatus

}

function triggerNameChange(team_name){

  let name = team_name;

  let teamAbreviation = name.slice(0, 3); 
  
  return teamAbreviation;

}





function BuildAGameBlocks(e){

      const incomingMatchData = e.data.matches;

      let div = " "; // empty string to reset the menu everytime the select is changed.

      liveMatchContainers.innerHTML = div;

      incomingMatchData.forEach(match => {

        let matchDateTime =  triggerMatchStatus(match)
        let homeTeamName = triggerNameChange(match.home_team_name)
        let awayTeamName = triggerNameChange(match.away_team_name)

        div = `<div id='match-games'>
                    <div id='clock'>${matchDateTime}</div>
                  <div class="team-container">
                    <div>${awayTeamName}</div>
                    <div>${match.away_goal}</div>
                  </div>
                  <div class="team-container">
                      <div >${homeTeamName}</div>
                      <div >${match.home_goal}</div>
                  </div>
              </div>`;

      liveMatchContainers.innerHTML += div;

    })
}

populateDropDownMenu();


COUNTRIES.addEventListener('change', LoadGameNewSelectedGameWeek);

