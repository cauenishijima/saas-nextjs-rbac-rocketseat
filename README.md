# SaaS CSN Júpiter

This project is a financial manager for syndicate incluing: installment, apportionment, advance to supplier and GED

## Features

### Authentication

- [ ] It should be able to authenticate using e-mail & password;
- [ ] It should be able to authenticate using Github account;
- [ ] It should be able to recover password using e-mail;
- [x] It should be able to create an account (e-mail, name and password);

### Organizations

- [ ] It should be able to create a new organization;
- [ ] It should be able to get organizations to which the user belongs;
- [ ] It should be able to update an organization;
- [ ] It should be able to shutdown an organization;
- [ ] It should be able to transfer organization ownership;

### Invites

- [ ] It should be able to invite a new member (e-mail, role);
- [ ] It should be able to accept an invite;
- [ ] It should be able to revoke a pending invite;

### Members

- [ ] It should be able to get organization members;
- [ ] It should be able to update a member role;

### * Documents Types (Pensar se vai precisar ter)

### * Payments Methods (Pensar se vai precisar ter)

### Banks (Pensar em outro nome)

### Financial Accounts (Contas financeiras)

### Departments (Departamentos)

### Suppliers (Fornecedores)

### Accounts Payable (Contas a Pagar)

### Installmnets (Parcelas)

### Advances (Adiantamentos)

### Allocations (Rateios)

### Payments (Pagamentos)

### Billing

- [ ] It should be able to get billing details for organization ($20 per project / $10 per member excluding billing role);

## RBAC

Roles & permissions.

### Roles

- Owner (count as administrator)
- Administrator
- Member
- Billing (one per organization)
- Anonymous

### Permissions table

|                          | Administrator | Member | Billing | Anonymous |
| ------------------------ | ------------- | ------ | ------- | --------- |
| Update organization      | ✅            | ❌     | ❌      | ❌        |
| Delete organization      | ✅            | ❌     | ❌      | ❌        |
| Invite a member          | ✅            | ❌     | ❌      | ❌        |
| Revoke an invite         | ✅            | ❌     | ❌      | ❌        |
| List members             | ✅            | ✅     | ✅      | ❌        |
| Transfer ownership       | ⚠️            | ❌     | ❌      | ❌        |
| Update member role       | ✅            | ❌     | ❌      | ❌        |
| Delete member            | ✅            | ⚠️     | ❌      | ❌        |
| Get billing details      | ✅            | ❌     | ✅      | ❌        |
| Export billing details   | ✅            | ❌     | ✅      | ❌        |

> ✅ = allowed
> ❌ = not allowed
> ⚠️ = allowed w/ conditions

#### Conditions

- Only owners may transfer organization ownership;
- Members can leave their own organization;


https://accounts.google.com/o/oauth2/v2/auth?access_type=online&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&include_granted_scopes=true&state=6a3b9d5f80f0d262b7371e182735b85cd1fa928658c3f1b41562fdf6e96ed56e&response_type=code&client_id=606451606475-o7oo003r6n1q49pb5ora5rkhc3ifh83r.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback


eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiQ2F1ZSIsImVtYWlsIjoiY2F1ZUBhY21lLmNvbSIsInN1YiI6IjMyNWUwODA5LTA5NGYtNGQ3My1hNWVkLTE4NTNlNDc0N2RhMyIsImlhdCI6MTcxNzY5Nzc2OSwiZXhwIjoxNzE4MzAyNTY5fQ.L-TeobqyG0Vk1WCH3NtSBS4jdQrSp_QIaXrHMY7W6fY