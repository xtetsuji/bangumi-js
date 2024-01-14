import { BangumiProgramHandler } from "../handler/bangumi_program_handler";
import { BetaBuildDateHandler } from "../handler/beta_build_date_handler";

console.log(
    `start GBangumi2GCal Chrome Extension: BUILD_DATE=${BetaBuildDateHandler.getBuildDate()}`
);
BangumiProgramHandler.inject();
