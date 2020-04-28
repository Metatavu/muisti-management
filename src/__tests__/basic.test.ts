import AndroidUtils from "../utils/android-utils";
import { DeviceModel } from "../generated/client";

describe("Android utils tests", () => {

  const deviceModel: DeviceModel = {
    "manufacturer":"Oneplus",
    "model":"7T Pro",
    "dimensions":{
      "deviceWidth":76.0,
      "deviceHeight":163.0,
      "deviceDepth":9.0,
      "screenWidth":71.0,
      "screenHeight":154.0      
    },
    "displayMetrics":{
      "heightPixels":3120,
      "widthPixels":1440,
      "density":3.0,
      "xdpi":515.0,
      "ydpi":516.0      
    },
    "capabilities":{
      "touch": true      
    }
  };

  it("test getDisplayMetrics", () => {
    const displayMetrics = AndroidUtils.getDisplayMetrics(deviceModel);

    expect(displayMetrics).toEqual({
      density: 3,
      heightPixels: 3120,
      widthPixels: 1440,
      xdpi: 515,
      ydpi: 516,
      densityDpi: 480
    });
  });

  it("test stringToPx", () => {
    const displayMetrics = AndroidUtils.getDisplayMetrics(deviceModel);

    expect(AndroidUtils.stringToPx(displayMetrics, "10dp", 1)).toEqual(30);
    expect(AndroidUtils.stringToPx(displayMetrics, "10dp", 2)).toEqual(60);
    expect(AndroidUtils.stringToPx(displayMetrics, "10dp", 0.5)).toEqual(15);
    expect(AndroidUtils.stringToPx(displayMetrics, "10sp", 1)).toEqual(30);
    expect(AndroidUtils.stringToPx(displayMetrics, "10sp", 2)).toEqual(60);
    expect(AndroidUtils.stringToPx(displayMetrics, "10sp", 0.5)).toEqual(15);
    expect(AndroidUtils.stringToPx(displayMetrics, "", 1)).toBeNull();
  });

  it("test convertPixelsToDp", () => {
    const displayMetrics = AndroidUtils.getDisplayMetrics(deviceModel);
    expect(AndroidUtils.convertPixelsToDp(displayMetrics, 30, 1)).toEqual(10);
    expect(AndroidUtils.convertPixelsToDp(displayMetrics, 15, 0.5)).toEqual(10);
    expect(AndroidUtils.convertPixelsToDp(displayMetrics, 60, 2)).toEqual(10);
  });

  it("test toCssColor", () => {
    expect(AndroidUtils.toCssColor("#E600FFFF")).toEqual("rgba(0, 255, 255, 0.9)");
    expect(AndroidUtils.toCssColor("#B00020")).toEqual("rgb(176, 0, 32)");
  });

})