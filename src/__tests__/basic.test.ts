import AndroidUtils from "../utils/android-utils";
import { DeviceModel } from "../generated/client";

describe("Android utils tests", () => {

  it("test getDisplayMetrics", () => {

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

})