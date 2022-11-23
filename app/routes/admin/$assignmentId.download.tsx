import { LoaderArgs } from "@remix-run/node";
import sanitize from "sanitize-filename";
import { number } from "zod";
import { httpResponse } from "~/http";
import { getAssignmentById } from "~/models/assignment.server";
import { getAllLogs } from "~/models/log.server";

export const loader = async ({ params }: LoaderArgs) => {
  if (!params.assignmentId) {
    return httpResponse.NotFound;
  }
  let assignmentId = Number(params.assignmentId);
  if (!number) {
    return httpResponse.BadRequest;
  }
  let assignment = await getAssignmentById(assignmentId);
  if (!assignment) {
    return httpResponse.NotFound;
  }
  let csvContent = await getLogsCSV(assignmentId);
  let response = new Response(csvContent);
  let filename = sanitize(assignment.name) || "导出";
  filename = encodeURIComponent(filename);
  response.headers.set(
    "Content-Disposition",
    `attachment; filename="${filename}.csv"`
  );
  response.headers.set("Content-type", "text/csv;charset=utf-8");
  return response;
};

const getLogsCSV = async (assignmentId: number) => {
  let logs = await getAllLogs(assignmentId);
  let rows = [
    [
      "姓名",
      "日期",
      "时间",
      "作业",
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
    rephrase: "造句",
  };
  rows = rows.concat(
    logs.map((log) => {
      return [
        log.userName,
        log.createdAt.toLocaleDateString("zh", { timeZone: "Asia/Shanghai" }),
        log.createdAt.toLocaleTimeString("zh", { timeZone: "Asia/Shanghai" }),
        log.assignment.name,
        log.question,
        log.example,
        actionMap[log.action],
        log.answer,
        log.userAgent,
      ];
    })
  );
  let csvContent = "\ufeff";

  const escape = (text: string) => {
    var result = text.replace(/"/g, '""');
    if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
    return result;
  };

  rows = rows.map((fields) => fields.map(escape));
  rows.forEach(function (rowArray) {
    let row = rowArray.join(",");
    csvContent += row + "\r\n";
  });

  return csvContent;
};
