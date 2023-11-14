import type { UnitType } from "@prisma/client";
import type { NextApiHandler, NextApiResponse } from "next";
import { prisma } from "~/server/db";

export type ReturnType = UnitType[];

const handler: NextApiHandler = async (_, res: NextApiResponse<ReturnType>) => {
  const unittypes = await prisma.unitType.findMany({});

  res.status(200).json(unittypes);
};

export default handler;
