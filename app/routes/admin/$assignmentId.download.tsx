import { LoaderArgs } from "@remix-run/node";
import { getAllLogs } from "~/models/log.server";
import { httpResponse } from '~/http';

export const loader = async ({ params }: LoaderArgs) => {
  if(!params.assignmentId){
    return httpResponse.NotFound;
  }
  let csvContent = await getLogsCSV(params.assignmentId);
  let response = new Response(csvContent);
  response.headers.set(
    "Content-Disposition",
    `attachment; filename="export.csv"`
  );
  response.headers.set("Content-type", "text/csv;charset=utf-8");
  return response;
};

const getLogsCSV = async (assignmentId: string) => {
  let logs = await getAllLogs(assignmentId);
  let rows = [
    [
      "姓名",
      "日期",
      "时间",
      "问题编号",
      "问题",
      "提示",
      "操作",
      "回答",
      "设备信息",
    ],
  ];
  let actionMap: { [key in string]: string } = {
    correct: "正确",
    unsure: "不确定",
    rephrase: "不正确",
  };
  rows = rows.concat(
    logs.map((log) => {
      return [
        log.userName,
        log.createdAt.toLocaleDateString("zh", { timeZone: "Asia/Shanghai" }),
        log.createdAt.toLocaleTimeString("zh", { timeZone: "Asia/Shanghai" }),
        log.taskId.toString(),
        log.question,
        log.example,
        actionMap[log.action],
        log.answer,
        log.userAgent,
      ];
    })
  );
  let csvContent = "\ufeff";

  rows.forEach(function (rowArray) {
    let row = rowArray.join(",");
    csvContent += row + "\r\n";
  });

  return csvContent;
};
