const schedule = require("node-schedule");
const fetch = require("node-fetch");
const Adopt = require("../model/adopt_model");
const shelterList = require("../data/adopt_shelter.json");
const cityRegion = require("../data/region_city.json");

const rule = new schedule.RecurrenceRule();
rule.hour = parseInt(process.env.ADOPT_SCHEDULE_HOUR);
rule.minute = parseInt(process.env.ADOPT_SCHEDULE_MINUTE);
rule.tz = "Asia/Taipei";

schedule.scheduleJob(rule, async () => {
  const url =
    "https://data.coa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL";
  const response = await fetch(url);
  const adoptData = await response.json();
  if (adoptData.length == 0) {
    return;
  }
  await Adopt.truncateAdoptData();
  // add formated URL and region category
  adoptData.map((data) => {
    data.link = `https://asms.coa.gov.tw/Amlapp/App/AnnounceList.aspx?Id=${data.animal_id}&AcceptNum=${data.animal_subid}&PageType=Adopt`;
    const place = data.animal_place.slice(0, 3);
    if (cityRegion.north.includes(place)) {
      data.region = "北部";
    }
    if (cityRegion.central.includes(place)) {
      data.region = "中部";
    }
    if (cityRegion.south.includes(place)) {
      data.region = "南部";
    }
    if (cityRegion.east.includes(place)) {
      data.region = "東部";
    }
    if (cityRegion.island.includes(place)) {
      data.region = "外島";
    }
  });
  await Adopt.updateAdoptData(adoptData);
});

const getShelters = async (req, res) => {
  return res.status(200).json(shelterList);
};

const getAdoptData = async (req, res) => {
  let { kind, region, shelter } = req.query;
  const all = "全部";
  const dog = "狗";
  const cat = "貓";
  const adoptPostLimit = parseInt(process.env.ADOPT_POST_LIMIT);

  let paging = parseInt(req.query.paging);
  if (!paging) {
    paging = 0;
  }
  const offset = paging * adoptPostLimit;
  let nextPaging;
  // with filter
  if (kind && shelter && region) {
    if (kind == all) {
      kind = [dog, cat];
    }
    // region filter
    if (shelter == all) {
      const regionData = await Adopt.getRegionAdoptData(
        kind,
        region,
        adoptPostLimit,
        offset
      );
      if (regionData.length > 0) {
        const regionLength = await Adopt.countAdoptDataByRegion(kind, region);
        const maxPage = Math.ceil(regionLength[0].count / adoptPostLimit) - 1;
        if (paging < maxPage) {
          nextPaging = paging + 1;
        }
        return res.status(200).json({ regionData, nextPaging: nextPaging });
      }
    }
    // shelter filter
    const filterData = await Adopt.getFilterAdoptData(
      kind,
      region,
      shelter,
      adoptPostLimit,
      offset
    );
    if (filterData.length > 0) {
      const filterLength = await Adopt.countAdoptDataByFilter(
        kind,
        region,
        shelter
      );
      const maxPage = Math.ceil(filterLength[0].count / adoptPostLimit) - 1;
      if (paging < maxPage) {
        nextPaging = paging + 1;
      }
      return res.status(200).json({ filterData, nextPaging: nextPaging });
    }
  }
  // without filter
  if (!(kind && shelter && region)) {
    const adoptData = await Adopt.getAllAdoptData(adoptPostLimit, offset);
    const adoptLength = await Adopt.countAdoptDataByRegion();
    const maxPage = Math.ceil(adoptLength[0].count / adoptPostLimit) - 1;
    if (paging < maxPage) {
      nextPaging = paging + 1;
    }
    return res.status(200).json({ adoptData, nextPaging: nextPaging });
  }
};

module.exports = { getShelters, getAdoptData };
