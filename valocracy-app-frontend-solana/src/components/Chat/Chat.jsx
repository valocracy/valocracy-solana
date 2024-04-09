import { useState, useEffect } from "react";
import { useRef } from "react";
import axios from "axios";
import Markdown from "./Markdown";
import "../../styles/chat.css";

export default function Chat() {
  const [userMessage, setText] = useState("");
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const NAME_AI = "Valocr.ai";
  const IMAGE_AI = "val.jpeg";
  const STYLE_IMAGE_AI_CHAT = {
    height: "26px",
    width: "26px",
    overflow: "hidden",
    borderRadius: "50%",
    backgroundImage: `url(${IMAGE_AI})`,
    backgroundPosition: "center", // Centraliza a imagem de fundo
    backgroundSize: "120%", // ou 'contain' dependendo da necessidade
    backgroundRepeat: "no-repeat",
    flexShrink: 0,
    zIndex: 1000000,
  };

  const [chats, setChats] = useState([]);
  const [load, setLoad] = useState(false);

  const messagesRequest = async (data) => {
    try {
      console.log({ data });

      return await axios
        .post(`https://lucy.monkeybranch.com.br/api/text/valocrai`, data)
        .then((e) => e.data.data.message);
    } catch (error) {
      console.log(error.response.data);
      return "Failed to generate your response, please try again";
    }
  };

  function Messages(messages, load) {
    const scrollToLastItem = useRef(null);

    setTimeout(() => {
      scrollToLastItem.current?.lastElementChild?.scrollIntoView({
        behavior: "smooth",
      });
    }, 1);

    return (
      <ul
        style={{
          padding: "0px 10px",
        }}
      >
        {messages?.map((chatMsg, idx) => {
          const isUser = chatMsg.role === "user";

          return (
            <li key={idx} ref={scrollToLastItem}>
              {isUser ? (
                <div>
                  <img
                    style={{
                      width: "26px",
                      height: "auto",
                      filter: "invert(100%)",
                    }}
                    src="profile-user.png"
                    alt="user"
                  />
                </div>
              ) : (
                <div style={STYLE_IMAGE_AI_CHAT}>
                  {/* <img src={IMAGE_AI} alt={NAME_AI} /> */}
                </div>
              )}

              {isUser ? (
                <div>
                  <p className="role-title"> You</p>
                  <Markdown text={chatMsg?.content || ""} />
                </div>
              ) : (
                <div>
                  <p className="role-title"> {NAME_AI} </p>
                  <Markdown text={chatMsg?.content || ""} />
                </div>
              )}
            </li>
          );
        })}

        {load && (
          <li ref={scrollToLastItem}>
            <div style={STYLE_IMAGE_AI_CHAT} />
            <div>
              {/* <p className="role-title"> {NAME_AI}  </p> */}
              <p>
                <span className={"Blink"}>|</span>
              </p>
            </div>
          </li>
        )}
      </ul>
    );
  }

  useEffect(() => {
    const func = async () => {
      try {
        let chatStorage = localStorage.getItem("chat");
        chatStorage = chatStorage ? JSON.parse(chatStorage) : [];

        setChats(chatStorage);
      } catch (error) {
        console.log("Error ==>", error.response.data.message);
      }
    };
    func();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!userMessage) return;

    setIsResponseLoading(true);

    try {
      let chatStorage = localStorage.getItem("chat");
      chatStorage = chatStorage ? JSON.parse(chatStorage) : [];

      chatStorage = [
        ...chatStorage,
        {
          role: "user",
          content: userMessage,
        },
      ];

      setChats(chatStorage);

      setLoad(true);

      localStorage.setItem("chat", JSON.stringify(chatStorage));

      const responseAI = await messagesRequest({
        system: "valocracy",
        temperature: 0.6,
        messages: chatStorage,
      });

      console.log(responseAI);

      if (
        responseAI &&
        responseAI != "'Failed to generate your response, please try again'"
      ) {
        chatStorage = [
          ...chatStorage,
          {
            role: "assistant",
            content: responseAI,
          },
        ];
      }

      setChats(chatStorage);
      localStorage.setItem("chat", JSON.stringify(chatStorage));
    } catch (e) {
      setErrorText(e.message);
      console.error(e.message);
      console.error(e?.response?.data);
    } finally {
      setIsResponseLoading(false);
      setLoad(false);
      setText("");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      // Se a tecla pressionada for "Enter" (sem a tecla Shift), submeta o formulário
      submitHandler(event);
    }
  };

  return (
    <>
      <div
        className={`back-chat ${isOpen ? "back-chat-block" : ""}`}
        onClick={() => setIsOpen(false)}
      ></div>
      <section className={`chat animated-div ${isOpen ? "open" : "closed"}`}>
        <button className="close-btn" onClick={() => setIsOpen(false)}>
          <img
            src="x.png"
            alt="1.2"
            style={{
              filter: "invert(100%)",
              height: "1.3rem",
            }}
          />
        </button>

        {!chats.length && (
          <div className="empty-chat-container">
            <img
              src={IMAGE_AI}
              alt={NAME_AI}
              style={{
                margin: "40px 0 0 0",
                height: "45px",
                width: "45px",
                overflow: "hidden",
                borderRadius: "50%",
                backgroundImage: `url(${IMAGE_AI})`,
                backgroundPosition: "center", // Centraliza a imagem de fundo
                backgroundSize: "120%", // ou 'contain' dependendo da necessidade
                backgroundRepeat: "no-repeat",
                flexShrink: 0,
              }}
            />
            <h3>How can I help you?</h3>
          </div>
        )}

        {/* //Mensagens do chat */}
        <div
          className="chat-header"
          style={{ margin: "40px 0 0 0", height: "100%" }}
        >
          {Messages(chats, load)}
        </div>

        <div className="chat-bottom">
          {errorText && <p className="errorText">{errorText}</p>}
          <form className="form-container" onSubmit={submitHandler}>
            <textarea
              type="text"
              placeholder="Envie sua mensagem"
              spellCheck="false"
              onKeyDown={handleKeyDown}
              rows={4}
              cols={50}
              style={{ resize: "none" }}
              value={isResponseLoading ? "Processing..." : userMessage}
              onChange={(e) => setText(e.target.value)}
              readOnly={isResponseLoading}
            />
            {!isResponseLoading && (
              <button type="submit">
                <img
                  src="send.png"
                  alt="send"
                  style={{
                    filter: "invert(100%)",
                    height: "1.3rem",
                  }}
                />
              </button>
            )}
          </form>
          <p>
            {/* ChatGPT can make mistakes. Consider checking important
              information. */}
          </p>
        </div>
      </section>
      <button
        className={`open-btn ${isOpen ? "open-btn-hidden" : ""}`}
        onClick={() => setIsOpen(true)}
        style={{
          background: "#22533D",
          padding: "15px",
          borderRadius: "50% 50% 50% 5px",
          boxShadow: "1px 1px 7px -2px #0f0f0f",
          border: "2px solid rgb(44, 119, 85)",
        }}
      >
        <img
          src="cha-ai.png"
          alt="ai"
          style={{
            width: "55px",
            filter: "invert(100%)",
          }}
        />
      </button>
    </>
  );
}
