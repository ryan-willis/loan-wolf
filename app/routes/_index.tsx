import { Text, Flex, Button, Anchor, Box } from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";

import { Logo } from "~/comps/logo";

export const meta: MetaFunction = () => {
  return [
    { title: "Loan Wolf" },
    {
      name: "description",
      content: "Track loan payments like you're on the hunt!",
    },
  ];
};

export default function Index() {
  return (
    <Flex direction="column" align="center" justify="center" gap="md" p="sm">
      <Logo h={128} w={128} />
      <Text
        style={{ textAlign: "center" }}
        size="5rem"
        fw={700}
        variant="gradient"
        gradient={{
          from: "teal",
          to: "blue",
          deg: 45,
        }}
      >
        LOAN WOLF
      </Text>
      <Text
        style={{ textAlign: "center" }}
        size="xl"
        fw={500}
        variant="gradient"
        gradient={{
          from: "blue",
          to: "teal",
          deg: 45,
        }}
      >
        Track loan payments like you&apos;re on the hunt!
      </Text>
      <Button
        component="a"
        href="/loans/sample-loan"
        variant="gradient"
        gradient={{
          from: "teal",
          to: "blue",
          deg: 45,
        }}
      >
        View Sample Loan
      </Button>
      - or -
      <Button
        component="a"
        href="/loans/create"
        variant="gradient"
        gradient={{
          from: "blue",
          to: "teal",
          deg: 45,
        }}
      >
        Create a Loan
      </Button>
      <Flex
        style={{ position: "fixed", bottom: "1rem" }}
        w="100%"
        gap=".25rem"
        justify="center"
      >
        <Text
          variant="gradient"
          gradient={{
            from: "blue",
            to: "teal",
            deg: 45,
          }}
        >
          made with ♥ by{" "}
        </Text>
        <Anchor
          href="https://ryanwillis.com"
          target="_blank"
          underline="always"
        >
          ryan
        </Anchor>
      </Flex>
    </Flex>
  );
}
