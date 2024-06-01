import { AppShell, Flex, Anchor, Text } from "@mantine/core";
import { MetaFunction, Outlet } from "@remix-run/react";

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

export default function LoansRoute() {
  return (
    <AppShell header={{ height: 60 }} withBorder={false} padding="xs">
      <AppShell.Header p="sm" h="60">
        <Anchor href="/" underline="never" c="white">
          <Flex align="center" gap="sm" justify="start">
            <Logo h={38} w={38} />
            <Text
              fw={700}
              variant="gradient"
              size="1.75rem"
              gradient={{
                from: "teal",
                to: "blue",
                deg: 45,
              }}
            >
              LOAN WOLF
            </Text>
          </Flex>
        </Anchor>
      </AppShell.Header>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
