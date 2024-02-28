import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import * as S from "./styles";

import api from "../../services/api";

const Repositorio = () => {
  const [currentRepo, setCurrentRepo] = useState({});
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const params = useParams();

  useEffect(() => {
    if (!params.repositorio) {
      return;
    }

    const load = () => {
      Promise.all([
        api.get(`/repos/${params.repositorio}`),
        api.get(`/repos/${params.repositorio}/issues`, {
          params: { state: "open", per_page: 5 },
        }),
      ])
        .then(responses => {
          setCurrentRepo(responses[0].data);
          setIssues(responses[1].data);
        })
        .catch(error => console.error(error))
        .finally(() => setLoading(false));
    };

    load();
  }, [params]);

  if (loading) {
    return (
      <S.Loading>
        <h1>Carregando...</h1>
      </S.Loading>
    );
  }

  return (
    <S.Container>
      <S.BackButton to="/">
        <FaArrowLeft color="#000" size={30} />
      </S.BackButton>

      <S.Owner>
        <img src={currentRepo.owner.avatar_url} alt={currentRepo.owner.login} />
        <h1>{currentRepo.name}</h1>
        <p>{currentRepo.description}</p>
      </S.Owner>

      <S.IssuesList>
        {issues.map(issue => (
          <li key={issue.id}>
            <img src={issue.user.avatar_url} alt={issue.user.login} />

            <div>
              <strong>
                <a href={issue.html_url}>{issue.title}</a>

                {issue.labels.map(label => (
                  <span key={label.id}>{label.name}</span>
                ))}
              </strong>

              <p>{issue.user.login}</p>
            </div>
          </li>
        ))}
      </S.IssuesList>
    </S.Container>
  );
};

export default Repositorio;
