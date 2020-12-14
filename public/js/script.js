/* eslint-disable no-use-before-define */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable func-names */
/* eslint-disable camelcase */
/* eslint-disable linebreak-style */
/* eslint-disable no-console */

let cid_name = [];
let org_total = [];
let ind_Total = [];
let representatives;
let senators = [];
let contact = [];
let numLegs;
let counter;
let rep;

const Samsons_key = '0e31f29705fa26f604e00f070aea5e11';
const Jooyongs_key = '165cf0bdb1b94281cb53560f4b66d567';
const tc_results = document.querySelector('.org_results_list');
const l_select = document.querySelector('.l_select');
const ic_results = document.querySelector('.result_list');
const ci_list = document.querySelector('.ci_list');
const filter_box = document.querySelector('.filter_box');

const chosen_State = document.querySelector('#chosen_State');

$(document).ready(() => {
  $('.map').usmap({});
});
async function getData(state) {
  const leg = [];
  senators = [];
  representatives = [];
  contact = [];

  const responce = await fetch(
    `https://www.opensecrets.org/api/?method=getLegislators&id=${state}&output=json&apikey=${Jooyongs_key}`
  );
  const data = await responce.json();
  leg.push(data.response.legislator);

  representatives = leg[0].map((x) => x);

  senators.push(representatives.pop());
  senators.push(representatives.pop());
  console.log(representatives);
  console.log(senators);

  state_Data = leg;
  numLegs = leg[0].length;
  rep = numLegs - 2;
  chosen_State.innerText = `The State you have chosen is: ${state} which has ${rep} Representatives and 2 Senators`;
  return leg[0];
}
async function getContr(cid_name) {
  counter += 1;
  const contr_arr = [];
  org_total = [];
  const leg_names = [];
  const contr_Res = await fetch(
    `https://www.opensecrets.org/api/?method=candContrib&cid=${cid_name[0]}&cycle=2020&output=json&apikey=${Samsons_key}`
  );

  const contributors = await contr_Res.json();
  for (num in contributors.response.contributors.contributor) {
    org_total.push([
      contributors.response.contributors.contributor[num]['@attributes']
        .org_name,
      contributors.response.contributors.contributor[num]['@attributes'].total
    ]);
  }
  leg_names.push([cid_name[1], cid_name[2]]);
  contr_arr.push(cid_name[1], org_total);
  if (counter <= numLegs) {
    drop_down(leg_names);
  } else if (counter > numLegs) {
    display_IndividualContr();
  }
}

// Beginning Jooyong Function 2
async function getContrByIndustry(cid_name) {
  const array1 = [];
  ind_Total = [];
  const ind_Names = [];
  const industry_js = await fetch(
    `https://www.opensecrets.org/api/?method=candIndustry&cid=${cid_name[0]}&cycle=2020&output=json&apikey=${Samsons_key}`
  );
  const industries = await industry_js.json();
  for (num in industries.response.industries.industry) {
    ind_Total.push([
      industries.response.industries.industry[num]['@attributes'].industry_name,
      industries.response.industries.industry[num]['@attributes'].total
    ]);
  }
  ind_Names.push(cid_name[1]);
  array1.push(cid_name[1], ind_Total);
  // console.log(array1);
  if (counter > numLegs) {
    display_IndustryContr();
  }
  // // End Jooyong Function 2
}

function filter_selection(evt) {
  selected = (evt.target.value);
  if (cid_name.length === 0) {
    return;
  }
  for (x in cid_name) {
    if (selected === `${cid_name[x][1]} ${cid_name[x][2]}`) {
      display_contact(cid_name[x]);
      getContr(cid_name[x]);
      getContrByIndustry(cid_name[x]);
    }
  }
}

function filter_menu(event) {
  let filter_arr = [];
  const form = $(event.target).serializeArray();
  if (form.length > 0) {
    $('.options').remove();
  }

  if (form[0].name === 'Senators') {
    for (x = 0; x < contact.length; x++) {
      console.log(senators[x]);

      filter_arr = senators.map((name) => ([name['@attributes'].firstlast, name['@attributes'].party]));
    }
  } else if (form[0].name === 'Representatives') {
    for (x = 0; x < contact.length; x++) {
      console.log(senators[x]);

      filter_arr = representatives.map((name) => ([name['@attributes'].firstlast, name['@attributes'].party]));
    }
  } else {
    const regex = new RegExp(form[0].name, 'gi');

    //   console.log(s)
    for (x = 0; x < contact.length; x++) {
      if (contact[x][1].match(regex)) {
        filter_arr.push([contact[x][0], contact[x][1]]);
      }
    }
  }
  console.log(filter_arr);
  drop_down(filter_arr);
}

$('.map').usmap({
  click: function (event, data) {
    $('#clicked-state');
    $('.options').remove();
    $('.contr_list').remove();

    const CID = getData(data.name);
    cid_name = [];
    contact = [];

    counter = 0;
    CID.then((result) => {
      for (num in result) {
        id = result[num]['@attributes'].cid;
        leg_name = result[num]['@attributes'].firstlast;
        party = result[num]['@attributes'].party;
        cid_name.push([id, leg_name, party]);
        congress_office = result[num]['@attributes'].congress_office;
        phone_num = result[num]['@attributes'].phone;
        website = result[num]['@attributes'].website;
        twitter_id = result[num]['@attributes'].twitter_id;
        contact.push([leg_name, party, congress_office, phone_num, website, twitter_id]);
      }
      for (num in cid_name) {
        getContr(cid_name[num]);
        getContrByIndustry(cid_name[num]);
      }
    });
  }
});

function drop_down(leg_names) {
  console.log(leg_names);
  const options = leg_names
    .map(
      (name) => `
  <option class= options>
      ${name[0]} ${name[1]}
  </option>
`
    )
    .join('');
  l_select.innerHTML += options;
}
function display_IndividualContr() {
  const html = org_total
    .map(
      (place) => `
      <li class=contr_list>
          <span class= "name">${place[0]} donated $${place[1]}</span> <br>
      </li>
  `
    )
    .join('');
  tc_results.innerHTML = html;
}
function display_IndustryContr() {
  const html2 = ind_Total
    .map(
      (place) => `
      <li class=contr_list>
          <span class= "name">${place[0]} donated $${place[1]}</span> <br>
      </li>
  `
    )
    .join('');
  ic_results.innerHTML = html2;
}
function display_contact(cid_name) {
  console.log(cid_name);
  console.log(contact);

  const filter_name = contact.filter((name) => {
    if (name[0] === cid_name[1]) {
      return name;
    }
  });

  const regexRussel = /Russell/;
  const regexDirksen = /Dirksen/;
  const regexHart = /Hart/;
  const regexCannon = /Cannon/;
  const regexLongworth = /Longworth/;
  const regexRayburn = /Rayburn/;

  if (regexRussel.test(filter_name)) {
    console.log(filter_name);
    const office_address = filter_name
      .map(
        (info) => `
          <li class=contr_list>
              <span class= "name"> The Legislator's address is: ${info[2]}, 2 Constitution Ave NE, Washington, DC 20002</span> <br>
          </li>
      `
      )
      .join('');
    ci_list.innerHTML = office_address;
  } else if (regexDirksen.test(filter_name)) {
    const office_address = filter_name
      .map(
        (info) => `
        <li class=contr_list>
            <span class= "name"> The Legislator's address is: ${info[2]}, 50 Constitution Ave NE, Washington, DC 20002</span> <br>
        </li>
    `
      )
      .join('');
    ci_list.innerHTML = office_address;
  } else if (regexHart.test(filter_name)) {
    const office_address = filter_name
      .map(
        (info) => `
        <li class=contr_list>
            <span class= "name"> The Legislator's address is: ${info[2]}, 120 Constitution Ave NE, Washington, DC 20002</span> <br>
        </li>
    `
      )
      .join('');
    ci_list.innerHTML = office_address;
  } else if (regexCannon.test(filter_name)) {
    const office_address = filter_name
      .map(
        (info) => `
        <li class=contr_list>
            <span class= "name"> The Legislator's address is: ${info[2]}, 27 Independence Ave SE, Washington, DC 20003</span> <br>
        </li>
    `
      )
      .join('');
    ci_list.innerHTML = office_address;
  } else if (regexLongworth.test(filter_name)) {
    const office_address = filter_name
      .map(
        (info) => `
        <li class=contr_list>
            <span class= "name"> The Legislator's address is: ${info[2]}, 15 Independence Ave SE, Washington, DC 20515</span> <br>
        </li>
    `
      )
      .join('');
    ci_list.innerHTML = office_address;
  } else if (regexRayburn.test(filter_name)) {
    const office_address = filter_name
      .map(
        (info) => `
        <li class=contr_list>
            <span class= "name"> The Legislator's address is: ${info[2]}, 45 Independence Ave SW, Washington, DC 20515</span> <br>
        </li>
    `
      )
      .join('');
    ci_list.innerHTML = office_address;
  }

  const other_info = filter_name
    .map(
      (info) => `
          <li class=contr_list>
              <span class= "name"> The Legislator's phone number is: ${info[3]}</span> <br>
          </li>
          <li class=contr_list>
              <span class= "name"> The Legislator's website is: <a href="${info[4]}">${info[4]}</a></span> <br>
          </li>
          <li class=contr_list>
              <span class= "name"> The Legislator's twitter is: <a href="https://twitter.com/${info[5]}">${info[5]}</a></span> <br>
          </li>
      `
    )
    .join('');
  ci_list.innerHTML += other_info;
}

const selection = document.querySelector('.l_select');

selection.addEventListener('change', (event) => {
  filter_selection(event);
});

filter_box.addEventListener('submit', async(event) => {
  event.preventDefault();
  filter_menu(event);
});