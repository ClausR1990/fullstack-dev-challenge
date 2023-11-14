import React, { type Dispatch, type SetStateAction } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { fetchData } from "~/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReturnType as VesselReturnType } from "../pages/api/voyage/getVessels";
import type { ReturnType as UnitTypeReturnType } from "../pages/api/voyage/getUnittypes";

import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { RangeCalendar } from "./range-calendar";
import { toast } from "./ui/use-toast";
import { VoyageCreatePayload } from "~/pages/api/voyage/create";

const formSchema = z.object({
  departureAndArrival: z.object({
    from: z.date({
      required_error: "Please provide *departure* date",
    }),
    to: z.date({
      required_error: "Please provide *arrival* date",
    }),
  }),
  PortOfLoading: z.string({
    required_error: "Please provide the PortOfLoading",
  }),
  PortOfDischarge: z.string({
    required_error: "Please provide the PortOfDischarge",
  }),
  vesselId: z.string({
    required_error: "Please provide the Vessel",
  }),
});

type FormData = z.infer<typeof formSchema>;

type CreateFormProps = {
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const CreateVoyageForm = ({ setOpen }: CreateFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const { data: vessels } = useQuery<VesselReturnType>(["vessels"], () =>
    fetchData("voyage/getVessels")
  );
  const { data: unitTypes } = useQuery<UnitTypeReturnType>(["unittypes"], () =>
    fetchData("voyage/getUnitTypes")
  );

  const queryClient = useQueryClient();
  const mutation = useMutation(
    async (values: VoyageCreatePayload) => {
      const response = await fetch(`/api/voyage/create`, {
        method: "PUT",
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        toast({
          title: "Failed to create the voyage",
          description: "Please try again!",
        });
      }
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["voyages"]);
        setOpen(false);
        form.reset();
      },
    }
  );

  const onSubmit = async (values: FormData) => {
    if (values.PortOfDischarge === values.PortOfLoading) {
      form.setError("PortOfDischarge", {
        message: "*Port Of Loading and* *Port Of Discharge* cannot be the same",
      });
      return;
    }
    const payload: VoyageCreatePayload = {
      portOfDischarge: values.PortOfDischarge,
      portOfLoading: values.PortOfLoading,
      vesselId: values.vesselId,
      scheduledDeparture: new Date(
        values.departureAndArrival.from
      ).toISOString(),
      scheduledArrival: new Date(values.departureAndArrival.to).toISOString(),
    };

    mutation.mutate(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="departureAndArrival"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departure and Arrival Dates</FormLabel>
              <RangeCalendar {...field} />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="PortOfLoading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port of Loading</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the Port of Loading" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Copenhagen">Copenhagen</SelectItem>
                    <SelectItem value="Oslo">Oslo</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Select the Port of Loading</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="PortOfDischarge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port of Discharge</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the Port of Discharge" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Copenhagen">Copenhagen</SelectItem>
                    <SelectItem value="Oslo">Oslo</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Select the Port of Discharge</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="vesselId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vessel</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the Vessel" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {vessels?.map((vessel, index) => (
                    <SelectItem key={index} value={vessel.id}>
                      {vessel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Select the Vessel</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create</Button>
      </form>
    </Form>
  );
};

export default CreateVoyageForm;
