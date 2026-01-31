export enum DeliveryMethodEnum {
  FACE_TO_FACE = "FACE_TO_FACE",
  ONLINE = "ONLINE",
  BLENDED = "BLENDED",
}

export const DeliveryMethodKorMap: Record<DeliveryMethodEnum, string> = {
  [DeliveryMethodEnum.FACE_TO_FACE]: "대면수업",
  [DeliveryMethodEnum.BLENDED]: "BL",
  [DeliveryMethodEnum.ONLINE]: "온라인100%",
};
