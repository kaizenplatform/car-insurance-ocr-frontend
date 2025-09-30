import policyResponse from "@/src/data/polocy-responce.json";
import licenseResponse from "@/src/data/license-responce.json";
import { Page1 } from "../types/form-data";


export function transformApiResponse() {
  const policyData = policyResponse.data;
  const licenseData = licenseResponse.data;

  const insuranceContract: Page1 = {
    radPreContInsco: policyData.insuranceCompany ?? "その他",
    "contentsform:radPrevcontyear": policyData.isOneYearContract ? "1年契約である" : "1年契約ではない",
    "contentsform:sltOcrdatey": `令和${policyData.expiryDate.year - 2018}(${policyData.expiryDate.year})年`,
    "contentsform:sltOcrdatem": `${policyData.expiryDate.month}月`,
    "contentsform:sltOcrdated": `${policyData.expiryDate.day}日`,
    "contentsform:sltOccdatey": `令和${policyData.insurancePeriod.start.year - 2018}(${policyData.insurancePeriod.start.year})年`,
    "contentsform:sltOccdatem": `${policyData.insurancePeriod.start.month}月`,
    "contentsform:sltOccdated": `${policyData.insurancePeriod.start.day}日`,
    "contentsform:sltOcrdateyMult": `令和${policyData.expiryDate.year - 2018}(${policyData.expiryDate.year})年`,
    "contentsform:sltOcrdatemMult": `${policyData.expiryDate.month}月`,
    "contentsform:sltOcrdatedMult": `${policyData.expiryDate.day}日`,
    "contentsform:sltBprefcl": policyData.nonFleetGrade || "",
    "contentsform:sltAcdtapply": policyData.accidentCoefficientPeriod || "",
    "contentsform:chkRgstDte-0": policyData.firstRegistrationYear ? true : false,
    "contentsform:radBvehtyp": "型式を入力する（型式がわかる方）",
    "contentsform:radCommuse": policyData.vehicleUsage || "",
    "contentsform:radBinslbzkc": "ご契約者自身",
    "contentsform:sltBinslbdoby": `平成${policyData.insuredPersonDob.year - 1988}(${policyData.insuredPersonDob.year})年`,
    "contentsform:sltBinslbdobm": `${policyData.insuredPersonDob.month}月`,
    "contentsform:sltBinslbdobd": `${policyData.insuredPersonDob.day}日`,
  };

  const vehicleInfo = {
    "contentsform:lstRgstdtegy": `令和${policyData.firstRegistrationYear.year - 2018}(${policyData.firstRegistrationYear.year})年`,
    "contentsform:lstRgstdtem": `${policyData.firstRegistrationYear.month}月`,
    "contentsform:radCommuse": policyData.vehicleUsage,
    "contentsform:radDumpcar": "ついている",
    "contentsform:radAebDvcePhSel": "ついている",
  };

  const personalInfo = {
    "contentsform:radBinslbzkc": "ご契約者自身",
    "contentsform:sltBinslbdoby":  `平成${licenseData.birthDate.year - 1988}(${licenseData.birthDate.year})年`,
    "contentsform:sltBinslbdobm": `${licenseData.birthDate.month}月`,
    "contentsform:sltBinslbdobd": `${licenseData.birthDate.day}日`,
  };

  return {
    insuranceContract,
    vehicleInfo,
    personalInfo,
  };
}
