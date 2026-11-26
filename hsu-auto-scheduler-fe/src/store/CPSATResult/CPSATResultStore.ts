import { create } from "zustand";
import {
  CPSATResultSliceType,
  createCPSATResultSlice,
} from "./CPSATResult.slice";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import {
  CPSATResultModalSliceType,
  createCPSATResultModalSlice,
} from "./CPSATResultModal.slice";
import {
  CPSATRequestSliceType,
  createCPSATRequestSlice,
} from "./CPSATRequest.slice";

type CPSATResultStoreType = CPSATResultModalSliceType &
  CPSATResultSliceType &
  CPSATRequestSliceType;

export const useCPSATResultStore = create<CPSATResultStoreType>()(
  devtools(
    subscribeWithSelector((...a) => ({
      ...createCPSATResultModalSlice(...a),
      ...createCPSATResultSlice(...a),
      ...createCPSATRequestSlice(...a),
    })),
  ),
);
