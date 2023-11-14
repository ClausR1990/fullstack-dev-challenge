import type { Vessel } from "@prisma/client";
import type { NextApiHandler, NextApiResponse } from "next";
import { prisma } from "~/server/db";

export type ReturnType = Vessel[];

const handler: NextApiHandler = async (_, res: NextApiResponse<ReturnType>) => {
  const vessels = await prisma.vessel.findMany({});

  res.status(200).json(vessels);
};

export default handler;
