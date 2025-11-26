-- Corrige sessão de votação e insere opções padrão
update voting_sessions vs
set repository_id = p.repository_id
from proposals p
where vs.proposal_id = p.id
  and vs.repository_id is null;

insert into voting_options (session_id, title, description, "order", value)
values (1, 'A favor', '', 0, 'yes');

insert into voting_options (session_id, title, description, "order", value)
values (1, 'Contra', '', 1, 'no');

insert into voting_options (session_id, title, description, "order", value)
values (1, 'Abstencao', '', 2, 'abstain');
