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
import { Checkbox } from "~/components/ui/checkbox";
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
  unitTypes: z.array(z.string()).min(5, {
    message: "Please provide minimum 5 Unit Types",
  }),
});

type FormData = z.infer<typeof formSchema>;

type CreateFormProps = {
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const CreateVoyageForm = ({ setOpen }: CreateFormProps) => {
  const { data: combinedData, isLoading } = useQuery(
    ["combinedData"],
    async () => {
      const [vesselsData, unitTypesData] = await Promise.all<
        [Promise<VesselReturnType>, Promise<UnitTypeReturnType>]
      >([fetchData("voyage/getVessels"), fetchData("voyage/getUnittypes")]);

      // You can return an object containing both data sets
      return { vessels: vesselsData, unitTypes: unitTypesData };
    }
  );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unitTypes: [],
    },
  });

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
      unitTypes: values.unitTypes,
    };

    mutation.mutate(payload);
  };

  if (isLoading) {
    return <div>...loading</div>;
  }

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
                  {combinedData?.vessels?.map((vessel, index) => (
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
        <FormField
          control={form.control}
          name="unitTypes"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Unit Types</FormLabel>
                <FormDescription>
                  Select the Unit Types you want for the Voyage.
                </FormDescription>
              </div>
              {combinedData?.unitTypes?.map((unitType) => (
                <FormField
                  key={unitType.id}
                  control={form.control}
                  name="unitTypes"
                  render={({ field }) => (
                    <FormItem
                      key={unitType.id}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(unitType.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, unitType.id])
                              : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== unitType.id
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {unitType.name}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </FormItem>
          )}
        />
        <Button type="submit">Create</Button>
      </form>
    </Form>
  );
};

export default CreateVoyageForm;
