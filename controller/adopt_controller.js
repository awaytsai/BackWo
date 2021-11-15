const schedule = require("node-schedule");
const fetch = require("node-fetch");
const Adopt = require("../model/adopt_model");
const shelterList = require("../public/data/adopt_shelter.json");

const rule = new schedule.RecurrenceRule();
rule.hour = 18;
rule.minute = 00;
rule.tz = "Asia/Taipei";

const job = schedule.scheduleJob(rule, async () => {
  console.log("crontab");
  const truncateResult = await Adopt.truncateAdoptData();
  const url =
    "https://data.coa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL";
  const response = await fetch(url);
  const adoptData = await response.json();
  // add link to each data
  // add URL and region
  adoptData.map((data) => {
    data.link = `https://asms.coa.gov.tw/Amlapp/App/AnnounceList.aspx?Id=${data.animal_id}&AcceptNum=${data.animal_subid}&PageType=Adopt`;
    const place = data.animal_place.slice(0, 3);
    if (
      place == "新北市" ||
      place == "臺北市" ||
      place == "桃園市" ||
      place == "新竹縣" ||
      place == "新竹市" ||
      place == "苗栗縣" ||
      place == "基隆市"
    ) {
      data.region = "北部";
    }
    if (place == "臺中市" || place == "彰化縣" || place == "南投縣") {
      data.region = "中部";
    }
    if (
      place == "臺南市" ||
      place == "高雄市" ||
      place == "南投縣" ||
      place == "雲林縣" ||
      place == "屏東縣" ||
      place == "嘉義市" ||
      place == "嘉義縣"
    ) {
      data.region = "南部";
    }
    if (place == "宜蘭縣" || place == "花蓮縣" || place == "臺東縣") {
      data.region = "東部";
    }
    if (place == "金門縣" || place == "連江縣" || place == "澎湖縣") {
      data.region = "外島";
    }
  });
  const adoptResult = await Adopt.updateAdoptData(adoptData);
});

const getShelters = async (req, res) => {
  return res.json(shelterList);
};

const getAdoptData = async (req, res) => {
  let { kind, region, shelter } = req.query;
  const limit = 60;
  let paging = parseInt(req.query.paging);
  if (!paging) {
    paging = 0;
  }
  const offset = paging * limit;
  let nextPaging;
  // with filter
  if (kind && shelter && region) {
    if (kind == "全部") {
      kind = ["狗", "貓"];
    }
    // for region
    if (shelter == "all") {
      const regionData = await Adopt.getRegionAdoptData(
        kind,
        region,
        limit,
        offset
      );
      if (regionData.length > 0) {
        const regionLength = await Adopt.countAdoptDataByRegion(kind, region);
        const maxPage = Math.ceil(regionLength[0].count / limit) - 1;
        if (paging < maxPage) {
          nextPaging = paging + 1;
        }
        return res.json({ regionData, nextPaging: nextPaging });
      }
    }

    // for shelter
    const filterData = await Adopt.getFilterAdoptData(
      kind,
      region,
      shelter,
      limit,
      offset
    );
    if (filterData.length > 0) {
      const filterLength = await Adopt.countAdoptData(kind, region, shelter);
      const maxPage = Math.ceil(filterLength[0].count / limit) - 1;
      if (paging < maxPage) {
        nextPaging = paging + 1;
      }
      return res.json({ filterData, nextPaging: nextPaging });
    }
  }
  // without filter
  if (!(kind && shelter && region)) {
    const adoptData = await Adopt.getAllAdoptData(limit, offset);
    const adoptLength = await Adopt.countAdoptData();
    // add paging (if exist)
    const maxPage = Math.ceil(adoptLength[0].count / limit) - 1;
    if (paging < maxPage) {
      nextPaging = paging + 1;
    }
    return res.json({ adoptData, nextPaging: nextPaging });
  }
};

module.exports = { getShelters, getAdoptData };
