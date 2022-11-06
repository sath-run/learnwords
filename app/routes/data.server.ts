interface Data {
  videoUrl: string;
  question: string;
  example: string;
  initial: string[];
  alternative: string[];
}

export const data: Data[] = [
  {
    videoUrl: "https://xin-yuwen.oss-cn-beijing.aliyuncs.com/1.mp4",
    question: "请看男孩做了什么?",
    example: "男孩书拿",
    initial: ["男孩", "书", "拿"],
    alternative: ["了", "在", "着"],
  },

  {
    videoUrl: "https://xin-yuwen.oss-cn-beijing.aliyuncs.com/2.mp4",
    question: "请看小兔做了什么？",
    example: "小兔打盒子开了",
    initial: ["小兔", "盒子", "打"],
    alternative: ["断", "走", "了", "在", "开"],
  },
  {
    videoUrl: "https://xin-yuwen.oss-cn-beijing.aliyuncs.com/3.mp4",
    question: "请看老虎做了什么？",
    example: "老虎打开了盒子",
    initial: ["老虎", "盒子", "打"],
    alternative: ["断", "走", "了", "在", "开"],
  },
];
