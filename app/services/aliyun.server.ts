import OSS from "ali-oss";
import invariant from "tiny-invariant";

invariant(process.env.ALIYUN_ACCESS_KEY_ID, "ALIYUN_ACCESS_KEY_ID must be set");
invariant(
  process.env.ALIYUN_ACCESS_KEY_SECRET,
  "ALIYUN_ACCESS_KEY_SECRET must be set"
);

export const client = new OSS({
  // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: "oss-cn-beijing",
  bucket: "xin-yuwen",
  // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
  accessKeyId: process.env["ALIYUN_ACCESS_KEY_ID"],
  accessKeySecret: process.env["ALIYUN_ACCESS_KEY_SECRET"],
});

export const listVideos = async () => {
  const result = await client.list({ "max-keys": 1000 }, {});
  return result.objects;
};
