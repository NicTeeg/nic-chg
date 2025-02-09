import { Card, List, Typography } from "@material-tailwind/react";

const Links = [
  {
    title: "Home",
    href: "#",
  },
  {
    title: "Charts",
    href: "#/charts",
  },
  {
    title: "Chart Changelog",
    href: "#/changelog",
  },
];

export function SideBar() {
  return (
    <Card className="max-w-[280px]">
      <Card.Header className="mx-4 mb-0 mt-3 h-max">
        <Typography className="font-semibold">Nic Changelog</Typography>
      </Card.Header>

      <Card.Body className="p-3">
        <List>
          {Links.map(({ title, href }) => (
            <List.Item key={title} as="a" href={href}>
              {title}
            </List.Item>
          ))}
        </List>
      </Card.Body>
    </Card>
  );
}
